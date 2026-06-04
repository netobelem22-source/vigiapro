const router = require('express').Router()
const { autenticar, autorizar } = require('../middleware/auth')
const prisma = require('../utils/prisma')

// Gera link de ponto para um pedido (ENTRADA ou SAIDA)
router.post('/gerar', autenticar, autorizar('GESTOR', 'GERENTE'), async (req, res, next) => {
  try {
    const { pedidoId, tipo } = req.body
    if (!pedidoId || !tipo) return res.status(400).json({ erro: 'pedidoId e tipo são obrigatórios' })

    const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId }, include: { unidade: true } })
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' })

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const link = await prisma.linkPonto.create({
      data: { pedidoId, tipo, expiresAt }
    })

    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/ponto/${link.token}`
    res.json({ link, url })
  } catch (err) { next(err) }
})

// Página pública do link — retorna dados do pedido
router.get('/ponto/:token', async (req, res, next) => {
  try {
    const link = await prisma.linkPonto.findUnique({
      where: { token: req.params.token },
      include: { pedido: { include: { unidade: true } } }
    })

    if (!link) return res.status(404).json({ erro: 'Link inválido' })
    if (link.usado) return res.status(410).json({ erro: 'Este link já foi utilizado' })
    if (new Date() > link.expiresAt) return res.status(410).json({ erro: 'Este link expirou' })

    res.json({
      tipo: link.tipo,
      unidade: link.pedido.unidade?.nome,
      cidade: link.pedido.unidade?.cidade,
      endereco: link.pedido.unidade?.endereco,
      data: link.pedido.data,
      expiresAt: link.expiresAt
    })
  } catch (err) { next(err) }
})

// Registra o ponto via link (sem autenticação)
router.post('/ponto/:token', async (req, res, next) => {
  try {
    const { latitude, longitude, fotoBase64, nomeVigia } = req.body
    const link = await prisma.linkPonto.findUnique({
      where: { token: req.params.token },
      include: { pedido: { include: { unidade: true } } }
    })

    if (!link) return res.status(404).json({ erro: 'Link inválido' })
    if (link.usado) return res.status(410).json({ erro: 'Este link já foi utilizado' })
    if (new Date() > link.expiresAt) return res.status(410).json({ erro: 'Link expirado' })

    const unidade = link.pedido.unidade
    const gpsValido = unidade?.latitude && latitude
      ? calcularDistancia({ latitude, longitude }, { latitude: unidade.latitude, longitude: unidade.longitude }) <= (unidade.raioGps || 200)
      : false

    // Busca ou cria usuário vigia pelo nome (simplificado — sem auth)
    let vigia = await prisma.usuario.findFirst({ where: { nome: nomeVigia, role: 'VIGIA' } })
    if (!vigia && nomeVigia) {
      vigia = await prisma.usuario.findFirst({ where: { unidadeId: link.pedido.unidadeId, role: 'VIGIA' } })
    }

    const ponto = await prisma.ponto.create({
      data: {
        tipo: link.tipo,
        horario: new Date(),
        latitude: latitude || null,
        longitude: longitude || null,
        gpsValido,
        fotoUrl: fotoBase64 || null,
        nomeVigia: nomeVigia || null,
        vigiaId: vigia?.id || (await prisma.usuario.findFirst({ where: { role: 'VIGIA' } }))?.id,
        unidadeId: link.pedido.unidadeId,
        pedidoId: link.pedidoId,
        status: 'ABERTO'
      }
    })

    // Marca link como usado
    await prisma.linkPonto.update({ where: { id: link.id }, data: { usado: true, vigiaId: vigia?.id } })

    res.json({ ok: true, ponto: { tipo: ponto.tipo, horario: ponto.horario, gpsValido } })
  } catch (err) { next(err) }
})

const calcularDistancia = (p1, p2) => {
  const R = 6371000
  const dLat = (p2.latitude - p1.latitude) * Math.PI / 180
  const dLon = (p2.longitude - p1.longitude) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(p1.latitude*Math.PI/180)*Math.cos(p2.latitude*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

module.exports = router
