const router = require('express').Router()
const { login, me, atualizarFcmToken } = require('../controllers/auth.controller')
const { autenticar } = require('../middleware/auth')

router.post('/login', login)
router.get('/me', autenticar, me)
router.patch('/fcm-token', autenticar, atualizarFcmToken)

module.exports = router
