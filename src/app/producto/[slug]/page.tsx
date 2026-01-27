'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Truck, Shield, Check } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { CartSheet } from '@/components/CartSheet'
import { useToast } from '@/hooks/use-toast'

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
  material?: string
  warranty?: string
  specifications?: any
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const { toast } = useToast()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState<any[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', comment: '' })
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [params.slug])

  const loadProduct = async () => {
    try {
      // Usar el mismo endpoint, ahora acepta SKU, slug o ID
      const res = await fetch(`/api/products/${params.slug}`)
      const data = await res.json()
      
      if (data.product) {
        setProduct(data.product)
        if (data.product.sizes?.length) setSelectedSize(data.product.sizes[0])
        if (data.product.colors?.length) setSelectedColor(data.product.colors[0])
        loadReviews(data.product.id)
      }
    } catch (error) {
      console.error('Error cargando producto:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async (productId: string) => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      const data = await res.json()
      setReviews(data)
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  const submitReview = async () => {
    const user = localStorage.getItem('user')
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para dejar una reseña.",
        variant: "destructive",
      })
      return
    }

    try {
      const userData = JSON.parse(user)
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          productId: product?.id,
          ...reviewData,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast({
        title: "Reseña publicada",
        description: "Tu reseña se ha publicado exitosamente.",
        variant: "success",
      })
      setShowReviewForm(false)
      setReviewData({ rating: 5, title: '', comment: '' })
      if (product) loadReviews(product.id)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Error al publicar reseña',
        variant: "destructive",
      })
    }
  }

  const toggleWishlist = async () => {
    const user = localStorage.getItem('user')
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para usar la lista de deseos.",
        variant: "destructive",
      })
      return
    }

    try {
      const userData = JSON.parse(user)
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          productId: product?.id,
        }),
      })

      const data = await res.json()
      setIsInWishlist(data.added || false)
      toast({
        title: data.added ? "Agregado a favoritos" : "Eliminado de favoritos",
        description: data.added ? "El producto se agregó a tu lista de deseos." : "El producto se eliminó de tu lista de deseos.",
        variant: "success",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al actualizar favoritos.",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      stock: product.stock,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500 dark:text-gray-400">Cargando producto...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Producto no encontrado</h2>
          <Link href="/productos">
            <Button>Ver todos los productos</Button>
          </Link>
        </div>
      </div>
    )
  }

  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/productos" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Volver</span>
          </Link>
          <Link href="/" className="text-2xl font-bold text-primary">
            Mi E-commerce
          </Link>
          <CartSheet />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  Sin imagen disponible
                </div>
              )}
              {product.featured && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Destacado
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedImage === idx 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Título y precio */}
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {product.category} {product.brand && `• ${product.brand}`}
              </div>
              <h1 className="text-3xl font-bold mb-4 dark:text-white">{product.name}</h1>
              
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-4xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatCurrency(product.comparePrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">(124 reseñas)</span>
              </div>
            </div>

            {/* Descripción */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 dark:text-white">Descripción</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            {/* Variantes: Tallas */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 dark:text-white">Talla</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variantes: Colores */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 dark:text-white">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                        selectedColor === color
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad */}
            <div>
              <h3 className="font-semibold mb-3 dark:text-white">Cantidad</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 rounded-lg dark:border-gray-700">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 font-semibold dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <Button
                className="w-full py-6 text-lg"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" onClick={toggleWishlist}>
                  <Heart className={`mr-2 h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  {isInWishlist ? 'En Favoritos' : 'Agregar a Favoritos'}
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="mr-2 h-5 w-5" />
                  Compartir
                </Button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold dark:text-white">Envío gratis</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">En compras mayores a S/ 100</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold dark:text-white">Compra segura</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Protección al comprador</div>
                </div>
              </div>
              {product.warranty && (
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold dark:text-white">Garantía</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{product.warranty}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Especificaciones técnicas */}
            {product.specifications && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3 dark:text-white">Especificaciones</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b dark:border-gray-700 last:border-0">
                        <span className="text-gray-600 dark:text-gray-400">{key}</span>
                        <span className="font-medium dark:text-white">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reseñas */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white">Reseñas de Clientes</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                    Escribir Reseña
                  </Button>
                </div>

                {showReviewForm && (
                  <div className="mb-6 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-semibold mb-4 dark:text-white">Tu Reseña</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Calificación
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewData({ ...reviewData, rating: star })}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  star <= reviewData.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 dark:text-white">
                          Título
                        </label>
                        <input
                          type="text"
                          className="w-full border dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2"
                          value={reviewData.title}
                          onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                          placeholder="Resume tu experiencia"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 dark:text-white">
                          Comentario
                        </label>
                        <textarea
                          className="w-full border dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2"
                          rows={4}
                          value={reviewData.comment}
                          onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                          placeholder="Cuéntanos sobre tu experiencia con este producto"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={submitReview}>
                          Publicar Reseña
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Aún no hay reseñas para este producto</p>
                      <p className="text-sm">¡Sé el primero en dejar una reseña!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b dark:border-gray-700 pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold dark:text-white">{review.user.name}</p>
                              {review.verified && (
                                <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded">
                                  ✓ Compra verificada
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                {new Date(review.createdAt).toLocaleDateString('es-PE')}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.title && (
                          <h4 className="font-semibold mb-1 dark:text-white">{review.title}</h4>
                        )}
                        {review.comment && (
                          <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

