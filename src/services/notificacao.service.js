// Para ativar: configure Firebase Admin SDK e descomente
// const admin = require('firebase-admin')
// admin.initializeApp({ credential: admin.credential.applicationDefault() })

const enviarNotificacao = async (fcmToken, { titulo, corpo, dados = {} }) => {
  try {
    // await admin.messaging().send({ token: fcmToken, notification: { title: titulo, body: corpo }, data: dados })
    console.log(`[NOTIF] ${titulo}: ${corpo}`)
  } catch (err) {
    console.error('Erro notificação:', err.message)
  }
}

module.exports = { enviarNotificacao }
