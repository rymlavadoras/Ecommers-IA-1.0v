'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Package, 
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  Loader2,
  Download,
  Eye,
  CheckCircle
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
  subtotal: number
  tax: number
  discount: number
  couponCode: string | null
  couponDiscount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerDni: string | null
  customerRuc: string | null
  shippingAddress: string
  shippingCity: string
  shippingDistrict: string
  notes: string | null
  createdAt: string
  paidAt: string | null
  items: OrderItem[]
  invoice?: {
    id: string
    fullNumber: string
    sunatStatus: string | null
    pdfUrl: string | null
    xmlContent: string | null
    qrCode: string | null
    createdAt: string
  } | null
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [generatingInvoice, setGeneratingInvoice] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [orderId])

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

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    if (!order) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar estado')
      }

      const data = await response.json()
      setOrder(data.order)
      toast({
        title: "Estado actualizado",
        description: "El estado de la orden se ha actualizado correctamente.",
        variant: "success",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Error al actualizar estado',
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const generateInvoice = async (documentType: '1' | '3') => {
    if (!order) return

    // Verificar que la orden esté pagada
    if (order.paymentStatus !== 'COMPLETED') {
      toast({
        title: "Orden no pagada",
        description: "La orden debe estar pagada para generar el comprobante.",
        variant: "destructive",
      })
      return
    }

    const docTypeName = documentType === '1' ? 'Factura' : 'Boleta'
    const confirmed = confirm(`¿Generar ${docTypeName} para la orden ${order.orderNumber}?`)
    
    if (!confirmed) return

    try {
      setGeneratingInvoice(true)
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order.id,
          documentType
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar comprobante')
      }

      toast({
        title: `${docTypeName} generada`,
        description: `${docTypeName} generada exitosamente: ${data.invoice.fullNumber}`,
        variant: "success",
      })
      
      // Recargar la orden para mostrar la factura
      await fetchOrder()
      
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Error al generar comprobante',
        variant: "destructive",
      })
    } finally {
      setGeneratingInvoice(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
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
              <Link href="/admin/ordenes">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a órdenes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusColors: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-orange-100 text-orange-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  const statusLabels: Record<OrderStatus, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    PROCESSING: 'En Preparación',
    SHIPPED: 'En Camino',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold dark:text-white">Orden #{order.orderNumber}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Info principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cambiar Estado */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Gestión de Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Actualiza el estado de la orden para notificar al cliente
                  </p>
                  <div className="flex gap-3">
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(value as OrderStatus)}
                      disabled={updating}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">⏳ Pendiente</SelectItem>
                        <SelectItem value="PAID">💳 Pagado</SelectItem>
                        <SelectItem value="PROCESSING">📦 En Preparación</SelectItem>
                        <SelectItem value="SHIPPED">🚚 En Camino</SelectItem>
                        <SelectItem value="DELIVERED">✅ Entregado</SelectItem>
                        <SelectItem value="CANCELLED">❌ Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    {updating && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Productos */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Productos ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                        <h3 className="font-semibold dark:text-white">{item.product.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {item.product.sku}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cantidad: {item.quantity}</p>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notas del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna derecha - Info del cliente y totales */}
          <div className="space-y-6">
            {/* Cliente */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <User className="h-5 w-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                  <p className="font-medium dark:text-white">{order.customerName}</p>
                </div>
                {order.customerDni && (
                  <div>
                    <p className="text-sm text-gray-600">DNI</p>
                    <p className="font-medium">{order.customerDni}</p>
                  </div>
                )}
                {order.customerRuc && (
                  <div>
                    <p className="text-sm text-gray-600">RUC</p>
                    <p className="font-medium">{order.customerRuc}</p>
                  </div>
                )}
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
                    <p className="text-sm text-gray-600">Dirección de Envío</p>
                    <p className="font-medium">
                      {order.shippingAddress}<br />
                      {order.shippingDistrict}, {order.shippingCity}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pago */}
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
              </CardContent>
            </Card>

            {/* Totales */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Resumen de Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Descuento</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                {order.couponDiscount > 0 && order.couponCode && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Cupón ({order.couponCode})</span>
                    <span>-{formatCurrency(order.couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>IGV (18%)</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-blue-600">{formatCurrency(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Acciones */}
            <div className="space-y-3">
              <Button className="w-full" asChild>
                <Link href={`/orden/${order.orderNumber}`} target="_blank">
                  Ver como Cliente
                </Link>
              </Button>
              {order.invoice ? (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-900">Factura Generada</p>
                      <p className="text-sm text-green-700">{order.invoice.fullNumber}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {new Date(order.invoice.createdAt).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {order.invoice.pdfUrl && (
                        <Button className="w-full" size="sm" variant="outline" asChild>
                          <a href={order.invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                          </a>
                        </Button>
                      )}
                      {order.invoice.xmlContent && (
                        <Button className="w-full" size="sm" variant="outline" asChild>
                          <a 
                            href={`data:application/xml;base64,${order.invoice.xmlContent}`}
                            download={`${order.invoice.fullNumber}.xml`}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Descargar XML
                          </a>
                        </Button>
                      )}
                      <Button className="w-full" size="sm" variant="ghost" asChild>
                        <Link href={`/admin/facturas`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver en Lista
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => generateInvoice(order.customerRuc ? '1' : '3')}
                    disabled={generatingInvoice || order.paymentStatus !== 'COMPLETED'}
                  >
                    {generatingInvoice ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generar {order.customerRuc ? 'Factura' : 'Boleta'}
                      </>
                    )}
                  </Button>
                  {order.paymentStatus !== 'COMPLETED' && (
                    <p className="text-xs text-center text-gray-500">
                      La orden debe estar pagada para emitir comprobante
                    </p>
                  )}
                </>
              )}
              {order.couponCode && (
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/admin/cupones">
                    🎟️ Ver Cupón Usado
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

