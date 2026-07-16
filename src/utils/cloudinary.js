const { v2: cloudinary } = require('cloudinary')

const url = process.env.CLOUDINARY_URL
let configurado = false
if (url) {
  const match = url.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/)
  if (match) {
    cloudinary.config({ api_key: match[1], api_secret: match[2], cloud_name: match[3] })
    configurado = true
  } else {
    console.error('CLOUDINARY_URL está definida mas não bate com o formato esperado (cloudinary://API_KEY:API_SECRET@CLOUD_NAME). Upload de fotos vai falhar.')
  }
}

const uploadFoto = async (base64) => {
  if (!base64 || !url) return base64
  if (!configurado) throw new Error('Cloudinary mal configurado no servidor. Contate o suporte.')
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'vigiapro/pontos',
      resource_type: 'image'
    })
    return result.secure_url
  } catch (e) {
    console.error('Falha ao enviar foto ao Cloudinary:', e.message)
    throw new Error('Não foi possível enviar a foto. Contate o suporte.')
  }
}

module.exports = { uploadFoto }
