import { v2 as cloudinary } from 'cloudinary'
import Logger from '@ioc:Adonis/Core/Logger'
import Env from '@ioc:Adonis/Core/Env'

cloudinary.config({
  secure: true,
  cloud_name: Env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: Env.get('CLOUDINARY_API_KEY'),
  api_secret: Env.get('CLOUDINARY_API_SECRET'),
})

export const uploadImage = async (imagePath, folder) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    folder,
  }
  const result = await cloudinary.uploader.upload(imagePath, options)
  return result.secure_url
}

export const getAssetInfo = async (publicId) => {
  const options = {
    colors: true,
  }

  try {
    const result = await cloudinary.api.resource(publicId, options)
    Logger.info({ result }, 'succesfully fetched asset information')
    return result.colors
  } catch (error) {
    Logger.error({ err: error }, 'failed to fetch asset information')
  }
}
