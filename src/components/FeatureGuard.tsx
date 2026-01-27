'use client'

import { ReactNode } from 'react'
import { isFeatureEnabled } from '@/config/features'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface FeatureGuardProps {
  feature: Parameters<typeof isFeatureEnabled>[0]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente que muestra contenido solo si una feature está habilitada
 * Útil para proteger páginas o secciones completas
 */
export function FeatureGuard({ feature, children, fallback }: FeatureGuardProps) {
  if (!isFeatureEnabled(feature)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              <CardTitle className="dark:text-white">Función No Disponible</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Esta funcionalidad no está disponible en tu plan actual. 
              Contacta con el administrador para más información sobre cómo habilitarla.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

