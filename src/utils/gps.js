const calcularDistancia = (p1, p2) => {
  const R = 6371000
  const dLat = (p2.latitude - p1.latitude) * Math.PI / 180
  const dLon = (p2.longitude - p1.longitude) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(p1.latitude * Math.PI / 180) *
    Math.cos(p2.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const validarGps = (pontoVigia, pontoUnidade, raioMetros) => {
  if (!pontoVigia?.latitude || !pontoUnidade?.latitude) return false
  return calcularDistancia(pontoVigia, pontoUnidade) <= raioMetros
}

module.exports = { calcularDistancia, validarGps }
