const router = require('express').Router()
const { autenticar, autorizar } = require('../middleware/auth')
const prisma = require('../utils/prisma')

router.use(autenticar, autorizar('GESTOR', 'GERENTE'))

router.get('/', async (req, res, next) => {
  try {
    const mes = parseInt(req.query.mes) || new Date().getMonth() + 1
    const ano = parseInt(req.query.ano) || new Date().getFullYear()
    const segmento = req.query.segmento || null

    const inicio = new Date(ano, mes - 1, 1)
    const fim = new Date(ano, mes, 1)

    let config = await prisma.configuracao.findFirst()
    const valorHoraGlobal = config?.valorDiaria || 33.80

    const whereBase = req.usuario.role === 'GERENTE'
      ? { unidadeId: req.usuario.unidadeId }
      : {}

    const pontos = await prisma.ponto.findMany({
      where: {
        ...whereBase,
        status: 'CONFIRMADO',
        horario: { gte: inicio, lt: fim }
      },
      include: {
        unidade: { include: { empresa: true } },
        vigia: true,
        pedido: true
      },
      orderBy: { horario: 'asc' }
    })

    // Monta pares entrada/saída por: unidade | pedido | dia
    const pares = {}
    for (const ponto of pontos) {
      const nomeVigia = ponto.nomeVigia || ponto.vigia?.nome || 'Desconhecido'
      const dia = new Date(ponto.horario).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' })
      // Pareia pelo pedidoId — entrada e saída do mesmo pedido formam o par
      const chave = ponto.pedidoId
        ? `${ponto.pedidoId}|${dia}`
        : `${ponto.unidadeId}|${nomeVigia}|${dia}`

      if (!pares[chave]) pares[chave] = { entrada: null, saida: null, nomeVigia }
      if (ponto.tipo === 'ENTRADA') {
        pares[chave].entrada = ponto
        pares[chave].nomeVigia = nomeVigia // usa nome da entrada
      }
      else if (ponto.tipo === 'SAIDA') pares[chave].saida = ponto
    }

    const porUnidade = {}

    for (const par of Object.values(pares)) {
      const { entrada, saida, nomeVigia } = par
      if (!entrada || !saida) continue

      // Segmento vem sempre da ENTRADA
      const segmentoPar = entrada.pedido?.segmento || null

      // Filtra por segmento se solicitado
      if (segmento && segmentoPar !== segmento) continue

      const uid = entrada.unidadeId
      const valorHora = entrada.unidade?.valorDiaria || valorHoraGlobal
      // Calcula diferença em minutos (mais preciso)
      const diffMs = new Date(saida.horario) - new Date(entrada.horario)
      const diffMin = Math.floor(diffMs / 60000)
      const horas = diffMin / 60 // mantém precisão em fração de hora

      if (!porUnidade[uid]) {
        porUnidade[uid] = {
          unidadeId: uid,
          unidade: entrada.unidade?.nome,
          cidade: entrada.unidade?.cidade,
          cnpj: entrada.unidade?.cnpj,
          empresa: entrada.unidade?.empresa?.nome,
          valorHora,
          registros: 0,
          totalHoras: 0,
          valorTotal: 0,
          detalhes: []
        }
      }

      porUnidade[uid].registros++
      porUnidade[uid].totalHoras += horas
      porUnidade[uid].valorTotal += horas * valorHora
      porUnidade[uid].detalhes.push({
        vigia: nomeVigia,
        segmento: segmentoPar,
        data: new Date(entrada.horario).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'),
        entrada: new Date(entrada.horario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
        saida: new Date(saida.horario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
        horas,
        valor: horas * valorHora
      })
    }

    const linhas = Object.values(porUnidade)
      .map(l => ({ ...l, totalHoras: Math.round(l.totalHoras * 100) / 100, valorTotal: Math.round(l.valorTotal * 100) / 100 }))
      .sort((a, b) => (a.cidade || '').localeCompare(b.cidade || ''))

    const totais = linhas.reduce((acc, l) => ({
      registros: acc.registros + l.registros,
      totalHoras: acc.totalHoras + l.totalHoras,
      valorTotal: acc.valorTotal + l.valorTotal
    }), { registros: 0, totalHoras: 0, valorTotal: 0 })

    totais.totalHoras = Math.round(totais.totalHoras * 100) / 100
    totais.valorTotal = Math.round(totais.valorTotal * 100) / 100

    res.json({ mes, ano, valorHoraGlobal, segmento, linhas, totais })
  } catch (err) { next(err) }
})

module.exports = router
