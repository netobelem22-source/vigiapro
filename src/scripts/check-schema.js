const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Tenta buscar uma unidade e ver os campos
  const unidade = await prisma.unidade.findFirst()
  console.log('Campos da unidade:', Object.keys(unidade || {}))
  console.log('Tem valorDiaria?', 'valorDiaria' in (unidade || {}))

  // Tenta atualizar com valorDiaria
  if (unidade) {
    try {
      await prisma.unidade.update({
        where: { id: unidade.id },
        data: { valorDiaria: 210 }
      })
      console.log('Atualização com valorDiaria funcionou!')
    } catch (err) {
      console.log('Erro ao atualizar:', err.message)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
