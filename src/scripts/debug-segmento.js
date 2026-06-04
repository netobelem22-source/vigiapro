const prisma = require('../utils/prisma')

async function main() {
  const pontos = await prisma.ponto.findMany({
    include: { pedido: true, vigia: true },
    orderBy: { horario: 'desc' },
    take: 10
  })

  for (const p of pontos) {
    console.log({
      id: p.id.slice(0,8),
      tipo: p.tipo,
      nomeVigia: p.nomeVigia,
      vigia: p.vigia?.nome,
      status: p.status,
      pedidoId: p.pedidoId,
      segmento: p.pedido?.segmento || 'SEM PEDIDO'
    })
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
