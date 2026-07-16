const prisma = require('./prisma')

const unidadesDoParceiro = async (usuarioId) => {
  const vinculos = await prisma.unidadeParceiro.findMany({ where: { usuarioId }, select: { unidadeId: true } })
  return vinculos.map(v => v.unidadeId)
}

module.exports = { unidadesDoParceiro }
