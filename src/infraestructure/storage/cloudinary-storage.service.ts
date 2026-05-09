import type { StorageService, UploadParams } from '@/application/ports/storage-service.js'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'node:stream'
export class CloudinaryStorageService implements StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    })
  }

  async upload(params: UploadParams): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: params.folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error ?? new Error('Falha ao fazer upload para o Cloudinary'))
          }
          resolve(result.secure_url)
        },
      )

      Readable.from(params.fileBuffer).pipe(uploadStream)
    })
  }

  async delete(fileUrl: string): Promise<void> {
    const matches = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/)

    if (!matches || !matches[1]) return

    const publicId = matches[1]

    await cloudinary.uploader.destroy(publicId)
  }
}