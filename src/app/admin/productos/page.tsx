'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { useToast } from '@/hooks/use-toast'
import { StockHistoryModal } from '@/components/StockHistoryModal'
import { ArrowLeft, Search, Edit, Trash2, Plus, AlertTriangle, Filter, History } from 'lucide-react'

function ProductosAdminContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [stockHistoryModal, setStockHistoryModal] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: '',
    productName: '',
  })

  useEffect(() => {
    // Check if lowStock param is in URL
    const lowStock = searchParams.get('lowStock')
    if (lowStock === 'true') {
      setShowLowStock(true)
    }
  }, [searchParams])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?limit=100')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({
          title: "Producto eliminado",
          description: "El producto ha sido desactivado correctamente.",
        })
        loadProducts()
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el producto.",
        variant: "destructive",
      })
    }
  }

  const updateStock = async (productId: string, newStock: number, reason?: string) => {
    try {
      // Obtener producto actual
      const product = products.find(p => p.id === productId)
      if (!product) return

      const previousStock = product.stock
      const stockChange = newStock - previousStock

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          stock: newStock,
          stockReason: reason || 'Actualización manual desde admin',
        }),
      })

      if (res.ok) {
        toast({
          title: "Stock actualizado",
          description: `Stock actualizado de ${previousStock} a ${newStock} unidades.`,
          variant: "success",
        })
        loadProducts() // Recargar lista
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el stock.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el stock.",
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase())
    
    const matchesLowStock = !showLowStock || product.stock < 10
    
    return matchesSearch && matchesLowStock
  })

  const lowStockCount = products.filter(p => p.stock < 10).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold dark:text-white">Gestión de Productos</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/admin/productos/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Alerta de Stock Bajo */}
        {lowStockCount > 0 && !showLowStock && (
          <Card className="mb-6 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-300">
                    ⚠️ {lowStockCount} producto{lowStockCount > 1 ? 's' : ''} con stock bajo (menos de 10 unidades)
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    Considera reabastecer estos productos pronto
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLowStock(true)}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <Filter className="h-4 w-4 mr-2" />
                Ver Productos
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Buscador */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, SKU o categoría..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant={showLowStock ? 'default' : 'outline'}
                onClick={() => setShowLowStock(!showLowStock)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showLowStock ? 'Mostrar Todos' : `Stock Bajo (${lowStockCount})`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats rápidos */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Productos</div>
              <div className="text-2xl font-bold dark:text-white">{products.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Stock Total</div>
              <div className="text-2xl font-bold dark:text-white">
                {products.reduce((sum, p) => sum + p.stock, 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Valor Inventario</div>
              <div className="text-2xl font-bold dark:text-white">
                {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.stock), 0))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-4">
              <div className="text-sm text-orange-700 dark:text-orange-400">Stock Bajo</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {products.filter(p => p.stock < 10).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de productos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No se encontraron productos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Imagen */}
                    <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover rounded"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 dark:text-white">{product.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium dark:text-white">
                              {product.category}
                            </span>
                            <span>SKU: {product.sku}</span>
                            {product.brand && <span>• {product.brand}</span>}
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-2xl font-bold text-primary">
                                {formatCurrency(product.price)}
                              </span>
                              {product.comparePrice && (
                                <span className="ml-2 text-sm text-gray-400 line-through">
                                  {formatCurrency(product.comparePrice)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                product.stock === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                product.stock < 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              }`}>
                                {product.stock === 0 ? '❌ Agotado' :
                                 product.stock < 10 ? `⚠️ Stock bajo: ${product.stock}` :
                                 `✅ Stock: ${product.stock}`}
                              </div>
                              {/* Edición rápida de stock */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    defaultValue={product.stock}
                                    className="w-20 h-8 text-sm"
                                    onBlur={(e) => {
                                      const newStock = parseInt(e.target.value) || 0
                                      if (newStock !== product.stock) {
                                        updateStock(product.id, newStock)
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.currentTarget.blur()
                                      }
                                    }}
                                  />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">unidades</span>
                                </div>
                                {/* Botón de historial */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => setStockHistoryModal({
                                    isOpen: true,
                                    productId: product.id,
                                    productName: product.name,
                                  })}
                                  title="Ver historial de stock"
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2">
                          <Link href={`/admin/productos/${product.id}/editar`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de historial de stock */}
      <StockHistoryModal
        isOpen={stockHistoryModal.isOpen}
        onClose={() => setStockHistoryModal({ isOpen: false, productId: '', productName: '' })}
        productId={stockHistoryModal.productId}
        productName={stockHistoryModal.productName}
      />
    </div>
  )
}

export default function ProductosAdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    }>
      <ProductosAdminContent />
    </Suspense>
  )
}

