const errorHandler = (err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ erro: err.message || 'Erro interno' })
}
module.exports = { errorHandler }
