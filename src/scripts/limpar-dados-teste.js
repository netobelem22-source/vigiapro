const prisma = require('../utils/prisma')

async function main() {
  console.log('Limpando dados de teste...')

  // Deleta pontos
  const pontos = await prisma.ponto.deleteMany({})
  console.log(`✅ ${pontos.count} pontos removidos`)

  // Deleta links
  const links = await prisma.linkPonto.deleteMany({})
  console.log(`✅ ${links.count} links removidos`)

  // Deleta histórico
  const historico = await prisma.historicoPedido.deleteMany({})
  console.log(`✅ ${historico.count} históricos removidos`)

  // Deleta pedidos
  const pedidos = await prisma.pedido.deleteMany({})
  console.log(`✅ ${pedidos.count} pedidos removidos`)

  // Mantém usuários, unidades, empresas e configurações
  console.log('✅ Usuários, unidades e empresas mantidos')
  console.log('🎉 Sistema zerado e pronto para uso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
