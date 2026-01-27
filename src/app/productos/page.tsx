'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { Search, X, User, LogOut } from 'lucide-react'
import { CartSheet } from '@/components/CartSheet'
import { useCart } from '@/contexts/CartContext'
import { AuthModal } from '@/components/AuthModal'
import { ThemeToggle } from '@/components/theme-toggle'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  comparePrice?: number
  stock: number
  sku: string
  images: string[]
  featured: boolean
  sizes?: string[]
  colors?: string[]
  brand?: string
}

function ProductosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addItem } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<any>(null)

  const categories = ['ROPA', 'ELECTRONICA', 'ALIMENTOS', 'OTROS']

  // Cargar usuario desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Cargar productos
  useEffect(() => {
    loadProducts()
  }, [category, search])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (search) params.append('search', search)

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error cargando productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadProducts()
  }

  const handleCategoryChange = (cat: string) => {
    setCategory(cat === category ? '' : cat)
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      stock: product.stock,
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            ShopPeru
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                  Hola, {user.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
                <User className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
            )}
            <ThemeToggle />
            <CartSheet />
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          const savedUser = localStorage.getItem('user')
          if (savedUser) {
            setUser(JSON.parse(savedUser))
          }
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header de productos */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">Nuestros Productos</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explora nuestro catálogo completo de ropa, electrónica, alimentos y más.
          </p>
        </div>

        {/* Barra de búsqueda */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-10 pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    loadProducts()
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <Button type="submit">Buscar</Button>
          </div>
        </form>

        {/* Filtros de categoría */}
        <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              className="whitespace-nowrap"
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </Button>
          ))}
          {category && (
            <Button variant="ghost" onClick={() => setCategory('')}>
              <X className="h-4 w-4 mr-2" />
              Limpiar filtro
            </Button>
          )}
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold mb-4">No hay productos disponibles</h3>
            <p className="text-gray-600 mb-8">
              {search || category
                ? 'No encontramos productos con esos criterios.'
                : 'No hay productos en el catálogo.'}
            </p>
            <Link href="/admin">
              <Button>Ir al Panel de Admin</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Mostrando {products.length} producto{products.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const discount = product.comparePrice 
                  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                  : 0
                
                return (
                  <Card key={product.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 shadow-md bg-white dark:bg-gray-800">
                    <CardHeader className="p-0">
                      <Link href={`/producto/${product.sku}`} className="block">
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-t-lg relative overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              Sin imagen
                            </div>
                          )}
                          {product.featured && (
                            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                              ⭐ Destacado
                            </div>
                          )}
                          {discount > 0 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              -{discount}%
                            </div>
                          )}
                        </div>
                      </Link>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                        {product.category} {product.brand && `• ${product.brand}`}
                      </div>
                      <Link href={`/producto/${product.sku}`}>
                        <CardTitle className="text-lg mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer dark:text-white">
                          {product.name}
                        </CardTitle>
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{product.description}</p>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(product.price)}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      {product.stock < 10 && product.stock > 0 && (
                        <p className="text-xs text-orange-500 mt-2 font-medium">
                          🔥 ¡Solo quedan {product.stock}!
                        </p>
                      )}
                      {product.stock === 0 && (
                        <p className="text-xs text-red-500 mt-2 font-medium">❌ Agotado</p>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/producto/${product.sku}`)}
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={product.stock === 0}
                        onClick={() => handleAddToCart(product)}
                      >
                        {product.stock === 0 ? 'Agotado' : 'Al Carrito'}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    }>
      <ProductosContent />
    </Suspense>
  )
}
