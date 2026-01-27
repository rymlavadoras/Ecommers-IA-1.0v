'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { isFeatureEnabled } from '@/config/features'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  FileText,
  BarChart3,
  Tag
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">Panel de Administración</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/">
              <Button variant="outline">Ver Tienda</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Ventas */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ventas Totales
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.totalOrders} órdenes completadas
              </p>
            </CardContent>
          </Card>

          {/* Órdenes Pendientes */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Órdenes Pendientes
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.pendingOrders}
              </div>
              <Link href="/admin/ordenes?status=PENDING">
                <p className="text-xs text-orange-600 mt-1 hover:underline cursor-pointer">
                  Ver pendientes →
                </p>
              </Link>
            </CardContent>
          </Card>

          {/* Total Productos */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Productos
              </CardTitle>
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalProducts}
              </div>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {stats.lowStockProducts} con stock bajo
              </p>
            </CardContent>
          </Card>

          {/* Total Usuarios */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Usuarios
              </CardTitle>
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalUsers}
              </div>
              <Link href="/admin/usuarios">
                <p className="text-xs text-purple-600 mt-1 hover:underline cursor-pointer">
                  Ver todos →
                </p>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/productos/nuevo" className="block">
            <Button className="w-full justify-start" size="lg">
              <Package className="mr-2 h-5 w-5" />
              Nuevo Producto
            </Button>
          </Link>
          
          <Link href="/admin/ordenes" className="block">
            <Button variant="outline" className="w-full justify-start" size="lg">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ver Órdenes
            </Button>
          </Link>
          
          {isFeatureEnabled('SUNAT_INVOICING') && (
            <Link href="/admin/facturas" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Facturación SUNAT
              </Button>
            </Link>
          )}
          
          <Link href="/admin/productos" className="block">
            <Button variant="outline" className="w-full justify-start" size="lg">
              <TrendingUp className="mr-2 h-5 w-5" />
              Gestionar Stock
            </Button>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {isFeatureEnabled('ANALYTICS') && (
            <Link href="/admin/analiticas" className="block">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-5 w-5" />
                Ver Analíticas
              </Button>
            </Link>
          )}
          
          {isFeatureEnabled('COUPONS') && (
            <Link href="/admin/cupones" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Tag className="mr-2 h-5 w-5" />
                Gestionar Cupones
              </Button>
            </Link>
          )}
          
          <Link href="/admin/usuarios" className="block">
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-5 w-5" />
              Gestionar Usuarios
            </Button>
          </Link>
        </div>

        {/* Órdenes Recientes */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="dark:text-white">Órdenes Recientes</CardTitle>
            <Link href="/admin/ordenes">
              <Button variant="ghost" size="sm">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : stats.recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay órdenes aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold dark:text-white">{order.orderNumber}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status === 'COMPLETED' ? 'Completado' :
                           order.status === 'PROCESSING' ? 'Procesando' :
                           order.status === 'PENDING' ? 'Pendiente' : order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {order.customerName} • {order.customerEmail}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg dark:text-white">
                        {formatCurrency(order.total)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('es-PE')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas */}
        {stats.lowStockProducts > 0 && (
          <Card className="mt-6 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-300">
                  Alerta de Stock Bajo
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  Hay {stats.lowStockProducts} productos con stock bajo. 
                  <Link href="/admin/productos?lowStock=true" className="underline ml-1">
                    Ver productos
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
