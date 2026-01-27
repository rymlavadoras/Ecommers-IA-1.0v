import { NextRequest, NextResponse } from 'next/server'

/**
 * Endpoint para subir imágenes
 * 
 * NOTA: Este endpoint convierte las imágenes a base64 data URLs.
 * Para producción, se recomienda migrar a Cloudinary, AWS S3, o similar.
 * 
 * Para usar Cloudinary:
 * 1. Instalar: npm install cloudinary
 * 2. Configurar variables de entorno: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * 3. Descomentar el código de Cloudinary abajo
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Tamaño máximo: 5MB' },
        { status: 400 }
      )
    }

    // OPCIÓN 1: Usar Cloudinary (recomendado para producción)
    // Descomentar si tienes Cloudinary configurado
    /*
    const cloudinary = require('cloudinary').v2
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          resource_type: 'image',
          transformation: [{ width: 1200, height: 1200, crop: 'limit' }] // Optimizar tamaño
        },
        (error: any, result: any) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      message: 'Imagen subida exitosamente'
    })
    */

    // OPCIÓN 2: Base64 Data URL (funcional pero no ideal para producción)
    // Útil para MVP y desarrollo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      success: true,
      url: dataUrl,
      message: 'Imagen subida exitosamente'
    })

  } catch (error: any) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json(
      { error: 'Error al subir la imagen', details: error.message },
      { status: 500 }
    )
  }
}

