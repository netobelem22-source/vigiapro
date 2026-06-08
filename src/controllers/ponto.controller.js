const prisma = require('../utils/prisma')
const { enviarNotificacao } = require('../services/notificacao.service')
const { validarGps } = require('../utils/gps')

const registrar = async (req, res, next) => {
  try {
    const { tipo, latitude, longitude, pedidoId, fotoUrl } = req.body
    const vigia = await prisma.usuario.findUnique({
      where: { id: req.usuario.id }, include: { unidade: true }
    })

    const gpsValido = validarGps(
      { latitude, longitude },
      { latitude: vigia.unidade?.latitude, longitude: vigia.unidade?.longitude },
      vigia.unidade?.raioGps || 200
    )

    const ponto = await prisma.ponto.create({
      data: {
        tipo, horario: new Date(), latitude, longitude,
        gpsValido, fotoUrl, vigiaId: vigia.id,
        unidadeId: vigia.unidadeId, pedidoId, status: 'ABERTO'
      },
      include: { vigia: true, unidade: true }
    })

    // Notifica gerentes da unidade
    const gerentes = await prisma.usuario.findMany({
      where: { unidadeId: vigia.unidadeId, role: 'GERENTE', ativo: true }
    })
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    for (const g of gerentes) {
      if (g.fcmToken) await enviarNotificacao(g.fcmToken, {
        titulo: `${tipo === 'ENTRADA' ? 'Chegada' : 'Saída'} registrada`,
        corpo: `${vigia.nome} registrou ${tipo.toLowerCase()} às ${hora}`,
        dados: { pontoId: ponto.id }
      })
    }

    res.status(201).json(ponto)
  } catch (err) { next(err) }
}

const confirmar = async (req, res, next) => {
  try {
    const ponto = await prisma.ponto.update({
      where: { id: req.params.id },
      data: { status: 'CONFIRMADO', confirmadoPorId: req.usuario.id, confirmedAt: new Date() },
      include: { vigia: true }
    })
    if (ponto.vigia?.fcmToken) await enviarNotificacao(ponto.vigia.fcmToken, {
      titulo: 'Presença confirmada',
      corpo: 'Seu registro foi confirmado pelo gerente.',
      dados: { pontoId: ponto.id }
    })
    res.json(ponto)
  } catch (err) { next(err) }
}

const listar = async (req, res, next) => {
  try {
    const { data, unidadeId, vigiaId } = req.query
    const where = {}
    if (req.usuario.role === 'VIGIA') where.vigiaId = req.usuario.id
    else if (req.usuario.role === 'GERENTE') where.unidadeId = req.usuario.unidadeId
    else {
      if (unidadeId) where.unidadeId = unidadeId
      if (vigiaId) where.vigiaId = vigiaId
    }
    if (data) {
      const inicio = new Date(data)
      const fim = new Date(data); fim.setDate(fim.getDate() + 1)
      where.horario = { gte: inicio, lt: fim }
    }
    const pontos = await prisma.ponto.findMany({
      where, include: { vigia: true, unidade: true, confirmadoPor: true, pedido: true },
      orderBy: { horario: 'desc' },
      take: 500
    })
    res.json(pontos)
  } catch (err) { next(err) }
}

module.exports = { registrar, confirmar, listar }
