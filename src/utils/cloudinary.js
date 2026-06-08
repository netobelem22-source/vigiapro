const { v2: cloudinary } = require('cloudinary')

const url = process.env.CLOUDINARY_URL
if (url) {
  const match = url.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/)
  if (match) {
    cloudinary.config({ api_key: match[1], api_secret: match[2], cloud_name: match[3] })
  }
}

const uploadFoto = async (base64) => {
  if (!base64 || !url) return base64
  const result = await cloudinary.uploader.upload(base64, {
    folder: 'vigiapro/pontos',
    resource_type: 'image'
  })
  return result.secure_url
}

module.exports = { uploadFoto }
