const router = require('express').Router()
const { autenticar, autorizar } = require('../middleware/auth')
const prisma = require('../utils/prisma')

router.use(autenticar, autorizar('GESTOR', 'GERENTE'))

router.get('/', async (req, res, next) => {
  try {
    const mes = parseInt(req.query.mes) || new Date().getMonth() + 1
    const ano = parseInt(req.query.ano) || new Date().getFullYear()

    const inicio = new Date(ano, mes - 1, 1)
    const fim = new Date(ano, mes, 1)

    let config = await prisma.configuracao.findFirst()
    if (!config) config = await prisma.configuracao.create({ data: { valorDiaria: 180 } })
    const valorDiaria = config.valorDiaria

    // Apenas pedidos CONFIRMADOS
    const where = req.usuario.role === 'GERENTE'
      ? { unidadeId: req.usuario.unidadeId, data: { gte: inicio, lt: fim }, status: 'CONFIRMADO' }
      : { data: { gte: inicio, lt: fim }, status: 'CONFIRMADO' }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: { unidade: { include: { empresa: true } }, solicitante: true },
      orderBy: [{ unidade: { cidade: 'asc' } }, { data: 'asc' }]
    })

    const porUnidade = {}
    for (const p of pedidos) {
      const uid = p.unidadeId
      if (!porUnidade[uid]) {
        porUnidade[uid] = {
          unidadeId: uid,
          unidade: p.unidade?.nome,
          cidade: p.unidade?.cidade,
          estado: p.unidade?.estado,
          empresa: p.unidade?.empresa?.nome,
          dias: 0, vigiasDia: 0, vigiasNoite: 0, totalDiarias: 0, valorTotal: 0
        }
      }
      porUnidade[uid].dias++
      porUnidade[uid].vigiasDia += p.qtdVigiaDia || 0
      porUnidade[uid].vigiasNoite += p.qtdVigiNoite || 0
      porUnidade[uid].totalDiarias += (p.qtdVigiaDia || 0) + (p.qtdVigiNoite || 0)
      porUnidade[uid].valorTotal += ((p.qtdVigiaDia || 0) + (p.qtdVigiNoite || 0)) * valorDiaria
    }

    const linhas = Object.values(porUnidade).sort((a, b) => a.cidade.localeCompare(b.cidade))
    const totais = linhas.reduce((acc, l) => ({
      dias: acc.dias + l.dias,
      vigiasDia: acc.vigiasDia + l.vigiasDia,
      vigiasNoite: acc.vigiasNoite + l.vigiasNoite,
      totalDiarias: acc.totalDiarias + l.totalDiarias,
      valorTotal: acc.valorTotal + l.valorTotal
    }), { dias: 0, vigiasDia: 0, vigiasNoite: 0, totalDiarias: 0, valorTotal: 0 })

    res.json({ mes, ano, valorDiaria, linhas, totais, totalPedidos: pedidos.length })
  } catch (err) { next(err) }
})

module.exports = router
