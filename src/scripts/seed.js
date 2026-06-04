const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Criando dados iniciais...')

  // Empresa
  const empresa = await prisma.empresa.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      nome: 'Rede Koch Supermercados',
      cnpj: '00.000.000/0001-00'
    }
  })
  console.log('✅ Empresa criada:', empresa.nome)

  // Usuário gestor
  const senhaHash = await bcrypt.hash('123456', 10)
  const gestor = await prisma.usuario.upsert({
    where: { email: 'gestor@vigiapro.com' },
    update: {},
    create: {
      nome: 'Gestor Principal',
      email: 'gestor@vigiapro.com',
      senha: senhaHash,
      role: 'GESTOR'
    }
  })
  console.log('✅ Gestor criado:', gestor.email)

  // Unidade de exemplo
  const unidade = await prisma.unidade.upsert({
    where: { id: 'unidade-001' },
    update: {},
    create: {
      id: 'unidade-001',
      nome: 'Supermercado Centro',
      endereco: 'Rua Principal, 100',
      cidade: 'Florianópolis',
      estado: 'SC',
      latitude: -27.5954,
      longitude: -48.5480,
      raioGps: 200,
      empresaId: empresa.id
    }
  })
  console.log('✅ Unidade criada:', unidade.nome)

  // Gerente da unidade
  const senhaGerente = await bcrypt.hash('123456', 10)
  const gerente = await prisma.usuario.upsert({
    where: { email: 'gerente@vigiapro.com' },
    update: {},
    create: {
      nome: 'Gerente Centro',
      email: 'gerente@vigiapro.com',
      senha: senhaGerente,
      role: 'GERENTE',
      unidadeId: unidade.id
    }
  })
  console.log('✅ Gerente criado:', gerente.email)

  // Vigia de exemplo
  const senhaVigia = await bcrypt.hash('123456', 10)
  const vigia = await prisma.usuario.upsert({
    where: { email: 'vigia@vigiapro.com' },
    update: {},
    create: {
      nome: 'Carlos Santos',
      email: 'vigia@vigiapro.com',
      senha: senhaVigia,
      role: 'VIGIA',
      unidadeId: unidade.id
    }
  })
  console.log('✅ Vigia criado:', vigia.email)

  console.log('\n🎉 Seed concluído! Credenciais de acesso:')
  console.log('─────────────────────────────────────')
  console.log('Gestor:  gestor@vigiapro.com  / 123456')
  console.log('Gerente: gerente@vigiapro.com / 123456')
  console.log('Vigia:   vigia@vigiapro.com   / 123456')
  console.log('─────────────────────────────────────')
}

main()
  .catch(e => { console.error('Erro:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
