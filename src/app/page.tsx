'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { 
  ShoppingBag, 
  Truck, 
  Shield, 
  Star, 
  TrendingUp,
  ArrowRight,
  Check,
  Zap,
  Award,
  Users
} from 'lucide-react'
import { CartSheet } from '@/components/CartSheet'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      const res = await fetch('/api/products?featured=true&limit=8')
      const data = await res.json()
      setFeaturedProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header con Gradiente */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b dark:border-gray-800 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ShopPeru
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/productos" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              Productos
            </Link>
            <Link href="/productos?category=ROPA" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              Ropa
            </Link>
            <Link href="/productos?category=ELECTRONICA" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              Electrónica
            </Link>
            <Link href="/productos?category=ALIMENTOS" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              Alimentos
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/productos">
              <Button variant="ghost" size="sm">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Catálogo
              </Button>
            </Link>
            <ThemeToggle />
            <CartSheet />
          </div>
        </div>
      </header>

      {/* Hero Section con Gradiente Animado */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold">
                <Zap className="h-4 w-4" />
                ¡Ofertas Exclusivas Online!
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight dark:text-white">
                Compra Todo lo que{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Necesitas
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Miles de productos de las mejores marcas. Envío gratis en compras mayores a S/ 100. 
                Paga con Yape, tarjetas o efectivo. ¡Compra segura garantizada! 🛡️
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/productos">
                  <Button size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                    Ver Catálogo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/productos?featured=true">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Ofertas del Día
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium">Envío Gratis +S/100</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">Compra Segura</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                    <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium">Productos Originales</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">50K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Clientes Felices</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">10K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Productos</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-6 text-center">
                  <Star className="h-12 w-12 mx-auto mb-3 text-yellow-500 dark:text-yellow-400" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">4.9/5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Valoración</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-6 text-center">
                  <Truck className="h-12 w-12 mx-auto mb-3 text-green-600 dark:text-green-400" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">24/48h</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Entrega Rápida</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 dark:text-white">Productos Destacados</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Los más vendidos de la semana</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando productos...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => {
                const discount = product.comparePrice 
                  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                  : 0

                return (
                  <Card key={product.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white dark:bg-gray-800">
                    <Link href={`/producto/${product.sku}`}>
                      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                        {product.images && product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        )}
                        {discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            -{discount}%
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ⭐ Top
                        </div>
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase font-semibold">
                        {product.category}
                      </div>
                      <Link href={`/producto/${product.sku}`}>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors dark:text-white">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      <Link href={`/producto/${product.sku}`} className="block">
                        <Button className="w-full" size="sm">
                          Ver Detalles
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/productos">
              <Button size="lg" variant="outline" className="px-8">
                Ver Todos los Productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 dark:text-white">¿Por qué comprar con nosotros?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">La mejor experiencia de compra online</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Envío Rápido y Gratis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Envío gratis en compras mayores a S/ 100. Recibe tu pedido en 24-48 horas en Lima.
              </p>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Compra 100% Segura</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Protección al comprador. Paga con Yape, tarjetas o efectivo. Tus datos están seguros.
              </p>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Productos Originales</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todas las marcas son originales. Garantía de devolución si no estás satisfecho.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">¿Listo para comprar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Únete a más de 50,000 clientes satisfechos. ¡Empieza a comprar ahora!
          </p>
          <Link href="/productos">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-12 shadow-xl">
              Explorar Catálogo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">ShopPeru</h3>
              <p className="text-sm">Tu tienda online de confianza en Perú.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Categorías</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/productos?category=ROPA" className="hover:text-white">Ropa</Link></li>
                <li><Link href="/productos?category=ELECTRONICA" className="hover:text-white">Electrónica</Link></li>
                <li><Link href="/productos?category=ALIMENTOS" className="hover:text-white">Alimentos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Ayuda</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Envíos</a></li>
                <li><a href="#" className="hover:text-white">Devoluciones</a></li>
                <li><a href="#" className="hover:text-white">Términos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: info@shopperu.com</li>
                <li>WhatsApp: +51 955 112 484</li>
                <li>Lima, Perú</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2026 ShopPeru. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
