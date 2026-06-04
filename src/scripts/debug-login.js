const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const usuario = await prisma.usuario.findFirst({ where: { email: 'gestor@vigiapro.com' } })
  
  if (!usuario) {
    console.log('Usuário NÃO encontrado no banco!')
    return
  }

  console.log('Usuário encontrado:', usuario.email)
  console.log('Role:', usuario.role)
  console.log('Ativo:', usuario.ativo)
  console.log('Hash da senha:', usuario.senha)

  // Testa se a senha 123456 bate com o hash
  const senhaCorreta = await bcrypt.compare('123456', usuario.senha)
  console.log('Senha 123456 está correta?', senhaCorreta)

  // Se não bate, força atualização
  if (!senhaCorreta) {
    console.log('Atualizando senha...')
    const novoHash = await bcrypt.hash('123456', 10)
    await prisma.usuario.update({
      where: { email: 'gestor@vigiapro.com' },
      data: { senha: novoHash }
    })
    console.log('Senha atualizada! Tente logar novamente.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
