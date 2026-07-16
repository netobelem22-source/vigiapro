const router = require('express').Router()
const { autenticar, autorizar } = require('../middleware/auth')
const prisma = require('../utils/prisma')

router.use(autenticar)
router.get('/', autorizar('GESTOR', 'GERENTE'), async (req, res, next) => {
  try {
    const empresas = await prisma.empresa.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } })
    res.json(empresas)
  } catch (err) { next(err) }
})
router.post('/', autorizar('GESTOR'), async (req, res, next) => {
  try {
    const empresa = await prisma.empresa.create({ data: req.body })
    res.status(201).json(empresa)
  } catch (err) { next(err) }
})

module.exports = router
