'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { FeatureGuard } from '@/components/FeatureGuard'
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
  Filter,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  type: string
  status: string
  customerName: string
  customerDNI: string
  total: number
  sunatStatus: string | null
  sunatCode: string | null
  pdfUrl: string | null
  xmlUrl: string | null
  createdAt: string
  orderId: string
  order: {
    id: string
    orderNumber: string
  }
}

export default function InvoicesAdminPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/invoices')
      
      if (!response.ok) throw new Error('Error al cargar facturas')
      
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      (invoice.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (invoice.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (invoice.order?.orderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusConfig = (status: string, sunatStatus: string | null) => {
    // Estados SUNAT (priorizan sobre el estado local)
    if (sunatStatus === 'ACEPTADO' || sunatStatus === 'ACCEPTED') {
      return {
        label: 'Aceptado por SUNAT',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: CheckCircle
      }
    }
    
    if (sunatStatus === 'RECHAZADO' || sunatStatus === 'REJECTED') {
      return {
        label: 'Rechazado por SUNAT',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: AlertCircle
      }
    }

    // Estados locales
    switch (status) {
      case 'ISSUED':
        return {
          label: 'Emitido',
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          icon: FileText
        }
      case 'SENT':
        return {
          label: 'Enviado',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          icon: CheckCircle
        }
      case 'CANCELLED':
        return {
          label: 'Anulado',
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          icon: AlertCircle
        }
      default:
        return {
          label: 'Generado - Por Enviar',
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          icon: FileText
        }
    }
  }

  return (
    <FeatureGuard feature="SUNAT_INVOICING">
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
                <h1 className="text-2xl font-bold dark:text-white">Gestión de Facturas</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Administra comprobantes electrónicos y envíos a SUNAT
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros y búsqueda */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por número, cliente o orden..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                >
                  Todos ({invoices.length})
                </Button>
                <Button
                  variant={filterStatus === 'ISSUED' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('ISSUED')}
                  size="sm"
                >
                  Emitidos
                </Button>
                <Button
                  variant={filterStatus === 'SENT' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('SENT')}
                  size="sm"
                >
                  Enviados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de facturas */}
        {loading ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando facturas...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 dark:text-white">No hay facturas</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No se encontraron facturas con los filtros aplicados'
                  : 'Las facturas aparecerán aquí cuando se procesen órdenes'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => {
              const statusConfig = getStatusConfig(invoice.status, invoice.sunatStatus)
              const StatusIcon = statusConfig.icon

              return (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${statusConfig.bgColor} dark:bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-bold text-lg dark:text-white">{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Orden: {invoice.order?.orderNumber || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(invoice.total)}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Cliente</p>
                            <p className="font-medium dark:text-white">{invoice.customerName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">DNI: {invoice.customerDNI}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Tipo</p>
                            <p className="font-medium dark:text-white">
                              {invoice.type === 'BOLETA' ? 'Boleta de Venta' : 'Factura'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Fecha de Emisión</p>
                            <p className="font-medium dark:text-white">
                              {new Date(invoice.createdAt).toLocaleDateString('es-PE')}
                            </p>
                          </div>
                        </div>

                        {invoice.sunatCode && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 mb-4">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Código SUNAT</p>
                            <p className="font-mono text-sm dark:text-white">{invoice.sunatCode}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {invoice.pdfUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                PDF
                              </a>
                            </Button>
                          )}
                          {invoice.xmlUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={invoice.xmlUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                XML
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/admin/ordenes/${invoice.order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Orden
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
    </FeatureGuard>
  )
}

