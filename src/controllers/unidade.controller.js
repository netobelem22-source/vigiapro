const prisma = require('../utils/prisma')

const listar = async (req, res, next) => {
  try {
    const unidades = await prisma.unidade.findMany({
      where: { ativo: true },
      include: { empresa: true },
      orderBy: [{ cidade: 'asc' }, { nome: 'asc' }]
    })
    res.json(unidades)
  } catch (err) { next(err) }
}

const criar = async (req, res, next) => {
  try {
    const { id, empresa, usuarios, pedidos, pontos, historico, ...data } = req.body
    const unidade = await prisma.unidade.create({ data, include: { empresa: true } })
    res.status(201).json(unidade)
  } catch (err) { next(err) }
}

const buscar = async (req, res, next) => {
  try {
    const unidade = await prisma.unidade.findUnique({
      where: { id: req.params.id },
      include: { usuarios: true, empresa: true }
    })
    if (!unidade) return res.status(404).json({ erro: 'Não encontrada' })
    res.json(unidade)
  } catch (err) { next(err) }
}

const atualizar = async (req, res, next) => {
  try {
    const { id, empresa, usuarios, pedidos, pontos, historico, ...data } = req.body
    const unidade = await prisma.unidade.update({
      where: { id: req.params.id },
      data,
      include: { empresa: true }
    })
    res.json(unidade)
  } catch (err) { next(err) }
}

module.exports = { listar, criar, buscar, atualizar }
