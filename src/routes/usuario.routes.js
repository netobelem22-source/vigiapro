const router = require('express').Router()
const { autenticar, autorizar } = require('../middleware/auth')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

router.use(autenticar)

router.get('/', autorizar('GESTOR', 'GERENTE'), async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { unidade: true },
      orderBy: { nome: 'asc' }
    })
    const sem_senha = usuarios.map(({ senha, ...u }) => u)
    res.json(sem_senha)
  } catch (err) { next(err) }
})

router.post('/', autorizar('GESTOR'), async (req, res, next) => {
  try {
    const { senha, ...resto } = req.body
    const hash = await bcrypt.hash(senha, 10)
    const usuario = await prisma.usuario.create({
      data: { ...resto, senha: hash },
      include: { unidade: true }
    })
    const { senha: _, ...dados } = usuario
    res.status(201).json(dados)
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ erro: 'Email já cadastrado' })
    next(err)
  }
})

router.put('/:id', autorizar('GESTOR'), async (req, res, next) => {
  try {
    const { senha, id, criadoEm, unidade, pedidos, pontos, confirmacoes, historicos, ...resto } = req.body
    const data = { ...resto }
    if (senha) data.senha = await bcrypt.hash(senha, 10)
    const usuario = await prisma.usuario.update({
      where: { id: req.params.id },
      data,
      include: { unidade: true }
    })
    const { senha: _, ...dados } = usuario
    res.json(dados)
  } catch (err) { next(err) }
})

router.delete('/:id', autorizar('GESTOR'), async (req, res, next) => {
  try {
    await prisma.usuario.update({
      where: { id: req.params.id },
      data: { ativo: false }
    })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// Unidades que um usuário TERCEIRO está autorizado a atender
router.get('/:id/unidades', autorizar('GESTOR'), async (req, res, next) => {
  try {
    const vinculos = await prisma.unidadeParceiro.findMany({
      where: { usuarioId: req.params.id },
      include: { unidade: true },
      orderBy: { unidade: { nome: 'asc' } }
    })
    res.json(vinculos.map(v => v.unidade))
  } catch (err) { next(err) }
})

router.post('/:id/unidades', autorizar('GESTOR'), async (req, res, next) => {
  try {
    const { unidadeId } = req.body
    if (!unidadeId) return res.status(400).json({ erro: 'unidadeId é obrigatório' })
    const vinculo = await prisma.unidadeParceiro.create({
      data: { usuarioId: req.params.id, unidadeId },
      include: { unidade: true }
    })
    res.status(201).json(vinculo)
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ erro: 'Unidade já vinculada a este usuário' })
    next(err)
  }
})

router.delete('/:id/unidades/:unidadeId', autorizar('GESTOR'), async (req, res, next) => {
  try {
    await prisma.unidadeParceiro.delete({
      where: { usuarioId_unidadeId: { usuarioId: req.params.id, unidadeId: req.params.unidadeId } }
    })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
