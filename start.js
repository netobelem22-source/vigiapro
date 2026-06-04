const { execSync } = require('child_process')
const path = require('path')

try {
  const prismaPath = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js')
  console.log('Gerando Prisma Client...')
  execSync(`node ${prismaPath} generate`, { stdio: 'inherit' })
  console.log('Prisma Client gerado!')
} catch (e) {
  console.log('Aviso: prisma generate falhou, continuando...', e.message)
}

require('./src/server.js')
