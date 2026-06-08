require('dotenv').config()
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL)
console.log('NODE_ENV:', process.env.NODE_ENV)
const app = require('./app')
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
