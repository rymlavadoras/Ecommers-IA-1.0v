'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, CreditCard, Smartphone, Check, XCircle, AlertCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { CulqiPayment } from '@/components/CulqiPayment'
import { YapePayment } from '@/components/YapePayment'
import { CashPayment } from '@/components/CashPayment'
import { NiubizPayment } from '@/components/NiubizPayment'
import { ThemeToggle } from '@/components/theme-toggle'
import { useToast } from '@/hooks/use-toast'
import { isFeatureEnabled } from '@/config/features'
import { MessageCircle } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [orderTotal, setOrderTotal] = useState(0)
  const [paymentError, setPaymentError] = useState('')
  const [showError, setShowError] = useState(false)
  
  // Cupones
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Datos del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dni: '',
    address: '',
    city: 'Lima',
    district: '',
    paymentMethod: 'YAPE',
    notes: '',
    orderVia: 'WEB', // WEB o WHATSAPP
  })

  useEffect(() => {
    // Cargar datos del usuario si está logueado
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dni: user.dni || '',
        address: user.address || '',
      }))
    }
  }, [])

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          subtotal: total,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Cupón no válido')
      }

      setAppliedCoupon({
        code: data.coupon.code,
        discount: data.discount,
      })
      setCouponError('')
    } catch (error: any) {
      setCouponError(error.message || 'Error al aplicar cupón')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Si es pedido por WhatsApp, redirigir a WhatsApp
    if (formData.orderVia === 'WHATSAPP') {
      const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '+51955112484'
      const itemsText = items.map(item => 
        `• ${item.name}${item.size ? ` (Talla: ${item.size})` : ''}${item.color ? ` (Color: ${item.color})` : ''} - ${item.quantity}x S/ ${item.price.toFixed(2)}`
      ).join('\n')
      const message = `Hola! Quiero realizar un pedido:\n\n${itemsText}\n\nTotal: S/ ${total.toFixed(2)}\n\nMi nombre: ${formData.name}\nMi teléfono: ${formData.phone}${formData.notes ? `\nNotas: ${formData.notes}` : ''}`
      const url = `https://wa.me/${whatsappPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      window.open(url, '_blank')
      return
    }
    
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
          total,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Si el método de pago es con tarjeta, mostrar formulario de pago
        if (formData.paymentMethod === 'CULQI' || formData.paymentMethod === 'NIUBIZ') {
          setOrderNumber(data.order.orderNumber)
          setOrderTotal(data.order.total)
          setShowPayment(true)
        } else if (formData.paymentMethod === 'YAPE' || formData.paymentMethod === 'CASH') {
          // Para Yape y Efectivo, mostrar instrucciones de pago
          setOrderNumber(data.order.orderNumber)
          setOrderTotal(data.order.total)
          setShowPayment(true)
        } else {
          // Para otros métodos, confirmar directamente
          setOrderId(data.order.orderNumber)
          setOrderPlaced(true)
          clearCart()
        }
      } else {
        toast({
          title: "Error al procesar pedido",
          description: data.error || 'No se pudo procesar el pedido',
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega productos para continuar con la compra</p>
          <Link href="/productos">
            <Button size="lg">Ver Productos</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Pantalla de pago con tarjeta
  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-center dark:text-white">Procesar Pago</h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {formData.paymentMethod === 'CULQI' ? (
            <CulqiPayment
              amount={orderTotal}
              email={formData.email}
              orderId={orderNumber}
              onSuccess={(chargeId) => {
                console.log('Pago confirmado, charge ID:', chargeId)
                setShowPayment(false)
                setOrderId(orderNumber)
                setOrderPlaced(true)
                clearCart()
              }}
              onError={(error) => {
                console.error('Error en pago:', error)
                setPaymentError(error)
                setShowError(true)
                setShowPayment(false)
              }}
            />
          ) : formData.paymentMethod === 'NIUBIZ' ? (
            <NiubizPayment
              amount={orderTotal}
              email={formData.email}
              orderId={orderNumber}
              onSuccess={(chargeId) => {
                console.log('Pago Niubiz confirmado, transaction ID:', chargeId)
                setShowPayment(false)
                setOrderId(orderNumber)
                setOrderPlaced(true)
                clearCart()
              }}
              onError={(error) => {
                console.error('Error en pago Niubiz:', error)
                setPaymentError(error)
                setShowError(true)
                setShowPayment(false)
              }}
            />
          ) : formData.paymentMethod === 'YAPE' ? (
            <YapePayment
              amount={orderTotal}
              orderId={orderNumber}
              phone={formData.phone}
              onConfirm={() => {
                setShowPayment(false)
                setOrderId(orderNumber)
                setOrderPlaced(true)
                clearCart()
              }}
            />
          ) : formData.paymentMethod === 'CASH' ? (
            <CashPayment
              amount={orderTotal}
              orderId={orderNumber}
              onConfirm={() => {
                setShowPayment(false)
                setOrderId(orderNumber)
                setOrderPlaced(true)
                clearCart()
              }}
            />
          ) : null}
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowPayment(false)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de error de pago
  if (showError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <Card className="max-w-md w-full bg-white dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Pago Rechazado</h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-200 text-left">
                  {paymentError}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => {
                  setShowError(false)
                  setPaymentError('')
                  setShowPayment(true)
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Intentar Otro Método de Pago
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowError(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Checkout
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/productos">
                  Cancelar y Volver a la Tienda
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <Card className="max-w-md w-full bg-white dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">¡Pedido Confirmado!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tu pedido <span className="font-semibold">{orderId}</span> ha sido procesado exitosamente.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold mb-2 dark:text-white">¿Qué sigue?</h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>✉️ Recibirás un email de confirmación</li>
                <li>📦 Te contactaremos para coordinar la entrega</li>
                <li>💳 Realiza el pago según el método seleccionado</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Link href={`/orden/${orderId}`} className="block">
                <Button className="w-full">📦 Ver Estado del Pedido</Button>
              </Link>
              <Link href="/productos" className="block">
                <Button variant="outline" className="w-full">Seguir Comprando</Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">Ir al Inicio</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shipping = total > 100 ? 0 : 15
  const couponDiscount = (isFeatureEnabled('COUPONS') && appliedCoupon?.discount) || 0
  const subtotalAfterCoupon = total - couponDiscount
  const igv = subtotalAfterCoupon * 0.18
  const finalTotal = subtotalAfterCoupon + shipping

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/productos" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Volver</span>
          </Link>
          <h1 className="text-2xl font-bold dark:text-white">Checkout</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Personal */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dni">DNI *</Label>
                      <Input
                        id="dni"
                        value={formData.dni}
                        onChange={(e) => setFormData({...formData, dni: e.target.value})}
                        required
                        maxLength={8}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dirección de Envío */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white">Dirección de Envío</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Dirección Completa *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Av. Principal 123, Dpto 456"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Select value={formData.city} onValueChange={(value) => setFormData({...formData, city: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lima">Lima</SelectItem>
                          <SelectItem value="Arequipa">Arequipa</SelectItem>
                          <SelectItem value="Cusco">Cusco</SelectItem>
                          <SelectItem value="Trujillo">Trujillo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="district">Distrito *</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                        placeholder="San Isidro"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tipo de Pedido (WhatsApp o Web) */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white">¿Cómo prefieres hacer tu pedido?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, orderVia: 'WEB'})}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        formData.orderVia === 'WEB'
                          ? 'border-primary bg-primary/10 dark:bg-primary/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="text-2xl mb-2">🛒</div>
                      <div className="font-semibold text-sm dark:text-white">Pedido Web</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completa aquí</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, orderVia: 'WHATSAPP'})}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        formData.orderVia === 'WHATSAPP'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-700/50'
                      }`}
                    >
                      <MessageCircle className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                      <div className="font-semibold text-sm dark:text-white">Pedido por WhatsApp</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Te redirigiremos</div>
                    </button>
                  </div>
                  {formData.orderVia === 'WHATSAPP' && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        📱 Al confirmar, serás redirigido a WhatsApp para completar tu pedido de forma rápida y personalizada.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Método de Pago - Solo si es pedido WEB */}
              {formData.orderVia === 'WEB' && (
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Método de Pago</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className={`grid gap-3 ${isFeatureEnabled('PAYMENT_MULTIPLE') ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
                      {isFeatureEnabled('PAYMENT_YAPE') && (
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, paymentMethod: 'YAPE'})}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          formData.paymentMethod === 'YAPE'
                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-700/50'
                        }`}
                      >
                        <Smartphone className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                        <div className="font-semibold text-sm dark:text-white">Yape</div>
                      </button>
                    )}
                    {isFeatureEnabled('PAYMENT_CULQI') && (
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, paymentMethod: 'CULQI'})}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          formData.paymentMethod === 'CULQI'
                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-700/50'
                        }`}
                      >
                        <CreditCard className="h-6 w-6 mx-auto mb-2 dark:text-gray-300" />
                        <div className="font-semibold text-sm dark:text-white">Tarjeta</div>
                      </button>
                    )}
                    {isFeatureEnabled('PAYMENT_NIUBIZ') && (
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, paymentMethod: 'NIUBIZ'})}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          formData.paymentMethod === 'NIUBIZ'
                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-700/50'
                        }`}
                      >
                        <CreditCard className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                        <div className="font-semibold text-sm dark:text-white">Niubiz</div>
                      </button>
                    )}
                    {isFeatureEnabled('PAYMENT_IZIPAY') && (
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, paymentMethod: 'IZIPAY'})}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          formData.paymentMethod === 'IZIPAY'
                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-700/50'
                        }`}
                      >
                        <CreditCard className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                        <div className="font-semibold text-sm dark:text-white">Izipay</div>
                      </button>
                    )}
                    {/* Efectivo siempre disponible como fallback */}
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'CASH'})}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        formData.paymentMethod === 'CASH'
                          ? 'border-primary bg-primary/10 dark:bg-primary/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">💵</div>
                      <div className="font-semibold text-sm dark:text-white">Efectivo</div>
                    </button>
                  </div>
                  <div>
                    <Label htmlFor="notes" className="dark:text-gray-300">Notas adicionales (opcional)</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Ej: Entregar en la tarde"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Información de contacto para WhatsApp */}
              {formData.orderVia === 'WHATSAPP' && (
                <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-green-900 dark:text-green-300 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Información para WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Completa tus datos básicos para que podamos identificarte en WhatsApp.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="whatsapp-name" className="dark:text-green-300">Nombre *</Label>
                        <Input
                          id="whatsapp-name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="whatsapp-phone" className="dark:text-green-300">Teléfono/WhatsApp *</Label>
                        <Input
                          id="whatsapp-phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          required
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notas adicionales */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div>
                    <Label htmlFor="notes" className="dark:text-gray-300">Notas adicionales (opcional)</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Ej: Entregar en la tarde"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Procesando...' : 
                 formData.orderVia === 'WHATSAPP' ? 
                   `📱 Continuar por WhatsApp` : 
                   `Confirmar Pedido - ${formatCurrency(finalTotal)}`}
              </Button>
            </form>
          </div>

          {/* Resumen del Pedido */}
          <div>
            <Card className="sticky top-4 bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded"
                            sizes="64px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium line-clamp-2 dark:text-white">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.size && `Talla: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          {item.quantity}x {formatCurrency(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cupón de descuento */}
                {isFeatureEnabled('COUPONS') && (
                  <div className="border-t pt-4">
                    {!appliedCoupon ? (
                      <div className="space-y-2">
                        <Label htmlFor="coupon" className="text-sm font-medium">
                          ¿Tienes un cupón de descuento?
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="coupon"
                            placeholder="Código del cupón"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            disabled={couponLoading}
                          />
                          <Button
                            type="button"
                            onClick={applyCoupon}
                            disabled={couponLoading || !couponCode}
                            variant="outline"
                          >
                            {couponLoading ? 'Validando...' : 'Aplicar'}
                          </Button>
                        </div>
                        {couponError && (
                          <p className="text-xs text-red-600 dark:text-red-400">{couponError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-300">
                              Cupón aplicado: {appliedCoupon.code}
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-400">
                              Descuento: {formatCurrency(appliedCoupon.discount)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeCoupon}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm dark:text-gray-300">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  {isFeatureEnabled('COUPONS') && appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>-{formatCurrency(appliedCoupon.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm dark:text-gray-300">
                    <span>Envío</span>
                    <span className={shipping === 0 ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
                      {shipping === 0 ? 'GRATIS' : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>IGV (18%)</span>
                    <span>{formatCurrency(igv)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t dark:border-gray-700 pt-2 dark:text-white">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                    💡 ¡Agrega {formatCurrency(100 - total)} más para envío gratis!
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <div>✓ Compra 100% segura</div>
                  <div>✓ Garantía de devolución</div>
                  <div>✓ Soporte 24/7</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

