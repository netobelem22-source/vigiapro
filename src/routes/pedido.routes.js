const router = require('express').Router()
const { autenticar, autorizar } = require('../middleware/auth')
const { listar, criar, buscar, atualizar, atualizarStatus, confirmarTodos } = require('../controllers/pedido.controller')

router.use(autenticar)
router.get('/', listar)
router.post('/', autorizar('GERENTE', 'GESTOR'), criar)
router.get('/:id', buscar)
router.patch('/:id', autorizar('GESTOR', 'GERENTE'), atualizar)
router.patch('/:id/status', autorizar('GESTOR', 'GERENTE', 'TERCEIRO'), atualizarStatus)
router.post('/confirmar-todos', autorizar('GESTOR', 'GERENTE'), confirmarTodos)

module.exports = router
