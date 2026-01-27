'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft, Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function OrdenesPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        loadOrders()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    order.customerName.toLowerCase().includes(search.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(search.toLowerCase())
  )

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
            <h1 className="text-2xl font-bold dark:text-white">Gestión de Órdenes</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Buscador */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Buscar por número, cliente o email..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filtro de estado */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PROCESSING">Procesando</SelectItem>
                  <SelectItem value="PAID">Pagado</SelectItem>
                  <SelectItem value="SHIPPED">Enviado</SelectItem>
                  <SelectItem value="DELIVERED">Entregado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de órdenes */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No se encontraron órdenes</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg dark:text-white">{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                          order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'PROCESSING' || order.status === 'PAID' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status === 'DELIVERED' ? 'Entregado' :
                           order.status === 'SHIPPED' ? 'Enviado' :
                           order.status === 'PROCESSING' ? 'Procesando' :
                           order.status === 'PAID' ? 'Pagado' :
                           order.status === 'PENDING' ? 'Pendiente' :
                           order.status === 'CANCELLED' ? 'Cancelado' : order.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          💳 {order.paymentStatus === 'COMPLETED' ? 'Pagado' :
                              order.paymentStatus === 'PENDING' ? 'Pendiente' : 'Fallido'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p><strong className="dark:text-white">Cliente:</strong> {order.customerName}</p>
                        <p><strong className="dark:text-white">Email:</strong> {order.customerEmail}</p>
                        <p><strong className="dark:text-white">Teléfono:</strong> {order.customerPhone}</p>
                        <p><strong className="dark:text-white">Fecha:</strong> {new Date(order.createdAt).toLocaleString('es-PE')}</p>
                      </div>
                    </div>

                    {/* Total y acciones */}
                    <div className="flex flex-col items-start lg:items-end gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(order.total)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.items?.length || 0} productos
                        </div>
                      </div>

                      {/* Acciones rápidas */}
                      <div className="flex gap-2">
                        {order.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Procesar
                          </Button>
                        )}
                        {order.status === 'PROCESSING' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Entregar
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/ordenes/${order.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

