/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false, // Cambia a true si tienes problemas con imágenes
  },
  // En Next.js 16, serverActions ya no necesita configuración explícita
  // El bodySizeLimit por defecto es suficiente
}

module.exports = nextConfig

