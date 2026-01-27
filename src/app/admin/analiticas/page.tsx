'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { FeatureGuard } from '@/components/FeatureGuard'
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react'

interface ProductSales {
  id: string
  name: string
  sku: string
  totalSold: number
  revenue: number
  imageUrl: string | null
}

interface Analytics {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  averageOrderValue: number
  topProducts: ProductSales[]
  revenueByCategory: { category: string; revenue: number }[]
  ordersbyStatus: { status: string; count: number }[]
  revenueGrowth: number
  ordersGrowth: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('all') // all, month, week

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error al cargar analíticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando analíticas...</p>
        </div>
      </div>
    )
  }

  return (
    <FeatureGuard feature="ANALYTICS">
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold dark:text-white">Analíticas y Reportes</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Información detallada sobre ventas y rendimiento
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 items-center">
              <ThemeToggle />
              <Button
                variant={timeRange === 'all' ? 'default' : 'outline'}
                onClick={() => setTimeRange('all')}
                size="sm"
              >
                Todo el tiempo
              </Button>
              <Button
                variant={timeRange === 'month' ? 'default' : 'outline'}
                onClick={() => setTimeRange('month')}
                size="sm"
              >
                Este mes
              </Button>
              <Button
                variant={timeRange === 'week' ? 'default' : 'outline'}
                onClick={() => setTimeRange('week')}
                size="sm"
              >
                Esta semana
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Métricas principales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(analytics.totalRevenue)}
              </div>
              {analytics.revenueGrowth !== 0 && (
                <div className={`flex items-center text-sm mt-2 ${
                  analytics.revenueGrowth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {analytics.revenueGrowth > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(analytics.revenueGrowth).toFixed(1)}% vs período anterior
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Órdenes
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {analytics.totalOrders}
              </div>
              {analytics.ordersGrowth !== 0 && (
                <div className={`flex items-center text-sm mt-2 ${
                  analytics.ordersGrowth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {analytics.ordersGrowth > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(analytics.ordersGrowth).toFixed(1)}% vs período anterior
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Valor Promedio
              </CardTitle>
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(analytics.averageOrderValue)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Por orden completada
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Clientes
              </CardTitle>
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {analytics.totalUsers}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Usuarios registrados
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Productos más vendidos */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <TrendingUp className="h-5 w-5" />
                Productos Más Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay ventas aún</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate dark:text-white">{product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{product.totalSold} vendidos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ingresos por categoría */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <BarChart3 className="h-5 w-5" />
                Ingresos por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.revenueByCategory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay datos aún</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.revenueByCategory.map((item) => {
                    const percentage = (item.revenue / analytics.totalRevenue) * 100
                    return (
                      <div key={item.category}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium dark:text-white">{item.category}</span>
                          <span className="text-green-600 dark:text-green-400 font-bold">
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {percentage.toFixed(1)}% del total
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Órdenes por estado */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <ShoppingCart className="h-5 w-5" />
              Órdenes por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              {analytics.ordersbyStatus.map((item) => (
                <div key={item.status} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {item.count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    {item.status === 'PENDING' ? 'Pendientes' :
                     item.status === 'PAID' ? 'Pagados' :
                     item.status === 'PROCESSING' ? 'Procesando' :
                     item.status === 'SHIPPED' ? 'Enviados' :
                     item.status === 'DELIVERED' ? 'Entregados' :
                     item.status === 'CANCELLED' ? 'Cancelados' : item.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </FeatureGuard>
  )
}

