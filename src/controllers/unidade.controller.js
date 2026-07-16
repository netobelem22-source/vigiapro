const prisma = require('../utils/prisma')
const { unidadesDoParceiro } = require('../utils/parceiro')

// campos enxutos para o papel TERCEIRO: sem diária, sem funcionários, sem dados da empresa cliente
const CAMPOS_PARCEIRO = { id: true, nome: true, endereco: true, cidade: true, estado: true, latitude: true, longitude: true, raioGps: true }

const listar = async (req, res, next) => {
  try {
    if (req.usuario.role === 'TERCEIRO') {
      const unidades = await prisma.unidade.findMany({
        where: { ativo: true, id: { in: await unidadesDoParceiro(req.usuario.id) } },
        select: CAMPOS_PARCEIRO,
        orderBy: [{ cidade: 'asc' }, { nome: 'asc' }]
      })
      return res.json(unidades)
    }
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
    if (req.usuario.role === 'TERCEIRO') {
      if (!(await unidadesDoParceiro(req.usuario.id)).includes(req.params.id))
        return res.status(403).json({ erro: 'Acesso não permitido' })
      const unidade = await prisma.unidade.findUnique({ where: { id: req.params.id }, select: CAMPOS_PARCEIRO })
      if (!unidade) return res.status(404).json({ erro: 'Não encontrada' })
      return res.json(unidade)
    }
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
