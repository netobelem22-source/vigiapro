const prisma = require('../utils/prisma')
const { rangeDiaBrasil } = require('../utils/data')

const resumoHoje = async (req, res, next) => {
  try {
    const { gte: hoje, lt: amanha } = rangeDiaBrasil()
    const where = req.usuario.role === 'GERENTE' ? { unidadeId: req.usuario.unidadeId } : {}

    // Busca configuração de valor
    let config = await prisma.configuracao.findFirst()
    if (!config) config = await prisma.configuracao.create({ data: { valorDiaria: 180 } })
    const valorDiaria = config.valorDiaria

    const [pedidosHoje, totalPontos, pontosAbertos, totalUnidades] = await Promise.all([
      prisma.pedido.findMany({ where: { ...where, data: { gte: hoje, lt: amanha } }, select: { status: true, qtdVigiaDia: true, qtdVigiNoite: true } }),
      prisma.ponto.count({ where: { ...where, horario: { gte: hoje, lt: amanha } } }),
      prisma.ponto.count({ where: { ...where, horario: { gte: hoje, lt: amanha }, status: 'ABERTO' } }),
      prisma.unidade.count({ where: { ativo: true } })
    ])

    const totalPedidos = pedidosHoje.length
    const pedidosPendentes = pedidosHoje.filter(p => p.status === 'PENDENTE').length
    const totalVigiasDia = pedidosHoje.reduce((s, p) => s + (p.qtdVigiaDia || 0), 0)
    const totalVigiasNoite = pedidosHoje.reduce((s, p) => s + (p.qtdVigiNoite || 0), 0)
    const totalVigias = totalVigiasDia + totalVigiasNoite
    const custoEstimado = totalVigias * 12 * valorDiaria

    res.json({
      totalPedidos, pedidosPendentes, totalPontos, pontosAbertos,
      totalUnidades, totalVigias, totalVigiasDia, totalVigiasNoite,
      custoEstimado, valorDiaria
    })
  } catch (err) { next(err) }
}

module.exports = { resumoHoje }
