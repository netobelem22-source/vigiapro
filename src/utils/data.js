// Intervalo de um dia (00:00 a 00:00 do dia seguinte) em horário de Brasília (fixo, sem
// horário de verão) — não no fuso local do servidor. O servidor roda em UTC (Railway);
// construir "hoje" com new Date(ano, mes, dia) usa o fuso do processo, então depois das
// 21h no Brasil (já 00h+ em UTC) o dia calculado ficava errado.
const rangeDiaBrasil = (dataStr) => {
  const dia = dataStr || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const inicio = new Date(`${dia}T00:00:00-03:00`)
  const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000)
  return { gte: inicio, lt: fim }
}

const hojeBrasil = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

module.exports = { rangeDiaBrasil, hojeBrasil }
