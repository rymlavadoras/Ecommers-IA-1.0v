'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft, Search, Mail, Phone, MapPin, Calendar } from 'lucide-react'

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.dni?.includes(search) ||
    user.ruc?.includes(search)
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold dark:text-white">Gestión de Usuarios</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Buscador */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <Input
                type="search"
                placeholder="Buscar por nombre, email, DNI o RUC..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</div>
              <div className="text-2xl font-bold dark:text-white">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Administradores</div>
              <div className="text-2xl font-bold dark:text-white">
                {users.filter(u => u.role === 'ADMIN').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Clientes</div>
              <div className="text-2xl font-bold dark:text-white">
                {users.filter(u => u.role === 'USER').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg dark:text-white">{user.name || 'Sin nombre'}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          }`}>
                            {user.role === 'ADMIN' ? '👑 Admin' : '👤 Cliente'}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {user.phone}
                          </div>
                        )}
                        {user.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {user.address}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Registro: {new Date(user.createdAt).toLocaleDateString('es-PE')}
                        </div>
                      </div>

                      {(user.dni || user.ruc) && (
                        <div className="flex gap-4 text-sm">
                          {user.dni && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">DNI:</span>
                              <span className="ml-2 font-medium dark:text-white">{user.dni}</span>
                            </div>
                          )}
                          {user.ruc && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">RUC:</span>
                              <span className="ml-2 font-medium dark:text-white">{user.ruc}</span>
                            </div>
                          )}
                          {user.businessName && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Empresa:</span>
                              <span className="ml-2 font-medium dark:text-white">{user.businessName}</span>
                            </div>
                          )}
                        </div>
                      )}
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

