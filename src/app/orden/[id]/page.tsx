'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'

type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    sku: string
    imageUrl: string | null
  }
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentMethod: string
  paymentStatus: string
  total: number
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  shippingCity: string
  shippingDistrict: string
  notes: string | null
  createdAt: string
  paidAt: string | null
  items: OrderItem[]
}

const statusConfig: Record<OrderStatus, { 
  label: string
  color: string
  bgColor: string
  icon: any
  description: string
}> = {
  PENDING: {
    label: 'Pendiente',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: Clock,
    description: 'Tu pedido está siendo revisado'
  },
  PAID: {
    label: 'Pagado',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: CreditCard,
    description: 'Pago confirmado, preparando pedido'
  },
  PROCESSING: {
    label: 'En Preparación',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: Package,
    description: 'Estamos preparando tu pedido'
  },
  SHIPPED: {
    label: 'En Camino',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: Truck,
    description: 'Tu pedido está en camino'
  },
  DELIVERED: {
    label: 'Entregado',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    description: '¡Pedido entregado con éxito!'
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: Clock,
    description: 'Pedido cancelado'
  }
}

const statusOrder: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/orders/${orderId}`)
        
        if (!response.ok) {
          throw new Error('Orden no encontrada')
        }

        const data = await response.json()
        setOrder(data)
      } catch (err: any) {
        setError(err.message || 'Error al cargar la orden')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando orden...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Orden no encontrada</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button asChild>
              <Link href="/productos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la tienda
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStatus = order.status
  const currentConfig = statusConfig[currentStatus]
  const CurrentIcon = currentConfig.icon
  const currentIndex = statusOrder.indexOf(currentStatus)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold dark:text-white">Seguimiento de Pedido</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">#{order.orderNumber}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Estado Actual */}
        <Card className="mb-6 bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${currentConfig.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                <CurrentIcon className={`h-8 w-8 ${currentConfig.color}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1 dark:text-white">{currentConfig.label}</h2>
                <p className="text-gray-600 dark:text-gray-300">{currentConfig.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Pedido realizado el {new Date(order.createdAt).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline de Estados */}
        {currentStatus !== 'CANCELLED' && (
          <Card className="mb-6 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Progreso del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {statusOrder.map((status, index) => {
                  const config = statusConfig[status]
                  const Icon = config.icon
                  const isCompleted = index <= currentIndex
                  const isActive = index === currentIndex
                  const isLast = index === statusOrder.length - 1

                  return (
                    <div key={status} className="relative">
                      <div className="flex items-center gap-4 pb-8">
                        {/* Línea vertical */}
                        {!isLast && (
                          <div className={`absolute left-6 top-12 w-0.5 h-full ${
                            isCompleted ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                        )}
                        
                        {/* Ícono */}
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>

                        {/* Texto */}
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                            {config.label}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{config.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Información de Envío */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <MapPin className="h-5 w-5" />
                Información de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                  <p className="font-medium dark:text-white">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-medium">
                    {order.shippingAddress}<br />
                    {order.shippingDistrict}, {order.shippingCity}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Pago */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <CreditCard className="h-5 w-5" />
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Método de Pago</p>
                <p className="font-medium dark:text-white">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado del Pago</p>
                <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                  order.paymentStatus === 'COMPLETED' 
                    ? 'bg-green-100 text-green-700' 
                    : order.paymentStatus === 'FAILED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.paymentStatus === 'COMPLETED' ? 'Pagado' : 
                   order.paymentStatus === 'FAILED' ? 'Fallido' : 'Pendiente'}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Pago</p>
                    <p className="font-medium">
                      {new Date(order.paidAt).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                </div>
              )}
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Productos */}
        <Card className="mt-6 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Productos ({order.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.price)} c/u</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notas */}
        {order.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notas del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/productos">
              Seguir Comprando
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

