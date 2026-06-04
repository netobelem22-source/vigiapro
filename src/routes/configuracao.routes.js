const router = require('express').Router()
const { autenticar, autorizar } = require('../middleware/auth')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.use(autenticar)

router.get('/', async (req, res, next) => {
  try {
    let config = await prisma.configuracao.findFirst()
    if (!config) config = await prisma.configuracao.create({ data: { valorDiaria: 180 } })
    res.json(config)
  } catch (err) { next(err) }
})

router.put('/', autorizar('GESTOR'), async (req, res, next) => {
  try {
    let config = await prisma.configuracao.findFirst()
    if (config) {
      config = await prisma.configuracao.update({ where: { id: config.id }, data: { valorDiaria: parseFloat(req.body.valorDiaria) } })
    } else {
      config = await prisma.configuracao.create({ data: { valorDiaria: parseFloat(req.body.valorDiaria) } })
    }
    res.json(config)
  } catch (err) { next(err) }
})

module.exports = router
