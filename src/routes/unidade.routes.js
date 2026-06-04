const router = require('express').Router()
const { autenticar, autorizar } = require('../middleware/auth')
const { listar, criar, buscar, atualizar } = require('../controllers/unidade.controller')

router.use(autenticar)
router.get('/', listar)
router.post('/', autorizar('GESTOR'), criar)
router.get('/:id', buscar)
router.put('/:id', autorizar('GESTOR'), atualizar)

module.exports = router
