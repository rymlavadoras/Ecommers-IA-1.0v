'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    comparePrice: number | null
    imageUrl: string | null
    stock: number
    sku: string
    slug: string
  }
}

export default function FavoritosPage() {
  const router = useRouter()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/productos')
      return
    }

    try {
      setLoading(true)
      const userData = JSON.parse(user)
      const res = await fetch(`/api/wishlist?userId=${userData.id}`)
      const data = await res.json()
      setWishlist(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    const user = localStorage.getItem('user')
    if (!user) return

    try {
      const userData = JSON.parse(user)
      await fetch(`/api/wishlist?userId=${userData.id}&productId=${productId}`, {
        method: 'DELETE',
      })
      loadWishlist()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const addToCart = (item: WishlistItem) => {
    addItem({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: 1,
      image: item.product.imageUrl || '',
      stock: item.product.stock,
    })
    toast({
      title: "Agregado al carrito",
      description: "El producto se ha agregado a tu carrito.",
      variant: "success",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-gray-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando favoritos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Mis Favoritos</h1>
              <p className="text-sm text-gray-600">
                {wishlist.length} producto{wishlist.length !== 1 ? 's' : ''} guardado{wishlist.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {wishlist.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tu lista está vacía</h2>
              <p className="text-gray-600 mb-6">
                Guarda tus productos favoritos aquí para encontrarlos fácilmente
              </p>
              <Button asChild>
                <Link href="/productos">
                  Explorar Productos
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <Link href={`/producto/${item.product.slug}`}>
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className="h-16 w-16 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item.product.id)}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                      title="Eliminar de favoritos"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>

                  <Link href={`/producto/${item.product.slug}`}>
                    <h3 className="font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(item.product.price)}
                    </span>
                    {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(item.product.comparePrice)}
                      </span>
                    )}
                  </div>

                  {item.product.stock === 0 ? (
                    <div className="bg-red-50 text-red-600 text-sm font-medium py-2 px-3 rounded text-center">
                      Agotado
                    </div>
                  ) : item.product.stock < 10 ? (
                    <>
                      <div className="bg-orange-50 text-orange-600 text-xs font-medium py-1 px-2 rounded text-center mb-2">
                        ⚠️ Solo quedan {item.product.stock} unidades
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => addToCart(item)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Agregar al Carrito
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Agregar al Carrito
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

