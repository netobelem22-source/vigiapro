const prisma = require('../utils/prisma')

const rangeData = (dataStr) => {
  const [ano, mes, dia] = dataStr.split('-').map(Number)
  return { gte: new Date(ano, mes - 1, dia, 0, 0, 0), lt: new Date(ano, mes - 1, dia + 1, 0, 0, 0) }
}

const dataLocal = (dataStr) => {
  const [ano, mes, dia] = dataStr.split('-').map(Number)
  return new Date(ano, mes - 1, dia, 12, 0, 0)
}

const registrarHistorico = async (pedidoId, usuarioId, acao, detalhe) => {
  try {
    await prisma.historicoPedido.create({ data: { pedidoId, usuarioId, acao, detalhe } })
  } catch (e) { console.error('Erro histórico:', e.message) }
}

const listar = async (req, res, next) => {
  try {
    const { data, unidadeId, status, cidade } = req.query
    const where = {}
    if (req.usuario.role === 'GERENTE') where.unidadeId = req.usuario.unidadeId
    else if (unidadeId) where.unidadeId = unidadeId
    if (data) where.data = rangeData(data)
    if (status) where.status = status
    if (cidade) where.unidade = { cidade: { contains: cidade, mode: 'insensitive' } }
    const pedidos = await prisma.pedido.findMany({
      where, include: { unidade: true, solicitante: true, pontos: { where: { status: { not: 'ABERTO' } } } }, orderBy: { criadoEm: 'desc' }
    })
    res.json(pedidos)
  } catch (err) { next(err) }
}

const criar = async (req, res, next) => {
  try {
    const { dataInicio, dataFim, turno, segmento, qtdVigiaDia, qtdVigiNoite, inicioTurnoDia, inicioTurnoNoite, observacao, unidadeId } = req.body

    const uid = unidadeId || req.usuario.unidadeId
    const inicio = dataLocal(dataInicio)
    const fim = dataLocal(dataFim || dataInicio)

    // Gera um pedido para cada dia do período
    const pedidos = []
    const atual = new Date(inicio)
    while (atual <= fim) {
      const dataStr = `${atual.getFullYear()}-${String(atual.getMonth()+1).padStart(2,'0')}-${String(atual.getDate()).padStart(2,'0')}`
      pedidos.push({
        data: dataLocal(dataStr),
        turno,
        segmento: segmento || 'LOJA',
        qtdVigiaDia: parseInt(qtdVigiaDia) || 0,
        qtdVigiNoite: parseInt(qtdVigiNoite) || 0,
        inicioTurnoDia, inicioTurnoNoite, observacao,
        unidadeId: uid,
        solicitanteId: req.usuario.id,
        status: 'PENDENTE'
      })
      atual.setDate(atual.getDate() + 1)
    }

    // Cria todos os pedidos de uma vez
    const criados = await prisma.$transaction(
      pedidos.map(p => prisma.pedido.create({ data: p, include: { unidade: true } }))
    )

    // Registra histórico do primeiro para referência
    if (criados.length > 0) {
      const detalhe = criados.length === 1
        ? `Pedido criado para ${criados[0].unidade?.nome}`
        : `${criados.length} pedidos criados (${dataInicio} até ${dataFim || dataInicio}) para ${criados[0].unidade?.nome}`
      await registrarHistorico(criados[0].id, req.usuario.id, 'CRIADO', detalhe)
    }

    res.status(201).json({ criados: criados.length, pedidos: criados })
  } catch (err) { next(err) }
}

const buscar = async (req, res, next) => {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: req.params.id },
      include: {
        unidade: true, solicitante: true,
        pontos: { include: { vigia: true } },
        historico: { include: { usuario: true }, orderBy: { criadoEm: 'desc' } }
      }
    })
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' })
    res.json(pedido)
  } catch (err) { next(err) }
}

const atualizarStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const pedido = await prisma.pedido.update({
      where: { id: req.params.id }, data: { status }, include: { unidade: true }
    })
    await registrarHistorico(pedido.id, req.usuario.id, status, `Status alterado para ${status}`)
    res.json(pedido)
  } catch (err) { next(err) }
}

const confirmarTodos = async (req, res, next) => {
  try {
    const { data } = req.body
    const where = { status: 'PENDENTE' }
    if (data) where.data = rangeData(data)
    if (req.usuario.role === 'GERENTE') where.unidadeId = req.usuario.unidadeId

    const pendentes = await prisma.pedido.findMany({ where, include: { unidade: true } })
    if (pendentes.length === 0) return res.json({ confirmados: 0 })

    await prisma.pedido.updateMany({ where: { id: { in: pendentes.map(p => p.id) } }, data: { status: 'CONFIRMADO' } })
    for (const p of pendentes) {
      await registrarHistorico(p.id, req.usuario.id, 'CONFIRMADO', 'Confirmado em lote')
    }

    res.json({ confirmados: pendentes.length })
  } catch (err) { next(err) }
}

module.exports = { listar, criar, buscar, atualizarStatus, confirmarTodos }
