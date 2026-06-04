const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('123456', 10)
  
  await prisma.usuario.updateMany({
    where: { email: { in: ['gestor@vigiapro.com', 'gerente@vigiapro.com', 'vigia@vigiapro.com'] } },
    data: { senha: hash }
  })

  console.log('Senhas atualizadas com sucesso!')
  console.log('gestor@vigiapro.com / 123456')
  console.log('gerente@vigiapro.com / 123456')
  console.log('vigia@vigiapro.com / 123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
