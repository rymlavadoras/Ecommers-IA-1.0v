/**
 * Sistema de Feature Flags por Paquete
 * 
 * Este archivo controla qué funcionalidades están disponibles según el paquete contratado.
 * 
 * Niveles disponibles:
 * - BASIC: Paquete básico
 * - STANDARD: Paquete estándar
 * - PREMIUM: Paquete premium
 * - ENTERPRISE: Paquete enterprise
 * 
 * Para cambiar el nivel, modifica PACKAGE_LEVEL en las variables de entorno.
 */

export type PackageLevel = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE'

export interface FeatureConfig {
  // IA y Chat
  AI_CHAT: boolean
  AI_CHAT_UNLIMITED: boolean // Si false, limita mensajes
  
  // Facturación SUNAT
  SUNAT_INVOICING: boolean
  SUNAT_MULTIPLE_DOCS: boolean // Boletas y facturas ilimitadas
  
  // Pagos
  PAYMENT_YAPE: boolean
  PAYMENT_CULQI: boolean
  PAYMENT_NIUBIZ: boolean
  PAYMENT_IZIPAY: boolean
  PAYMENT_MULTIPLE: boolean // Múltiples métodos de pago
  
  // Analíticas y Reportes
  ANALYTICS: boolean
  ANALYTICS_ADVANCED: boolean // Reportes avanzados
  
  // Productos
  PRODUCT_REVIEWS: boolean
  PRODUCT_WISHLIST: boolean
  PRODUCT_VARIANTS: boolean // Tallas, colores
  
  // Gestión
  STOCK_MANAGEMENT: boolean
  STOCK_HISTORY: boolean
  COUPONS: boolean
  MULTIPLE_ADMINS: boolean
  
  // Marketing
  EMAIL_NOTIFICATIONS: boolean
  WHATSAPP_NOTIFICATIONS: boolean
  
  // Extra
  CUSTOM_BRANDING: boolean
  API_ACCESS: boolean
  PRIORITY_SUPPORT: boolean
}

const FEATURES: Record<PackageLevel, FeatureConfig> = {
  BASIC: {
    // IA básico limitado
    AI_CHAT: true,
    AI_CHAT_UNLIMITED: false, // Límite de mensajes
    
    // Sin facturación SUNAT
    SUNAT_INVOICING: false,
    SUNAT_MULTIPLE_DOCS: false,
    
    // Solo Yape
    PAYMENT_YAPE: true,
    PAYMENT_CULQI: false,
    PAYMENT_NIUBIZ: false,
    PAYMENT_IZIPAY: false,
    PAYMENT_MULTIPLE: false,
    
    // Sin analíticas
    ANALYTICS: false,
    ANALYTICS_ADVANCED: false,
    
    // Productos básicos
    PRODUCT_REVIEWS: true,
    PRODUCT_WISHLIST: true,
    PRODUCT_VARIANTS: true,
    
    // Gestión básica
    STOCK_MANAGEMENT: true,
    STOCK_HISTORY: true,
    COUPONS: false,
    MULTIPLE_ADMINS: false,
    
    // Sin notificaciones automáticas
    EMAIL_NOTIFICATIONS: false,
    WHATSAPP_NOTIFICATIONS: false,
    
    // Sin extras
    CUSTOM_BRANDING: false,
    API_ACCESS: false,
    PRIORITY_SUPPORT: false,
  },
  
  STANDARD: {
    // IA sin límites
    AI_CHAT: true,
    AI_CHAT_UNLIMITED: true,
    
    // Facturación SUNAT básica
    SUNAT_INVOICING: true,
    SUNAT_MULTIPLE_DOCS: false, // Solo facturas, no boletas
    
    // Múltiples métodos de pago
    PAYMENT_YAPE: true,
    PAYMENT_CULQI: true,
    PAYMENT_NIUBIZ: true,
    PAYMENT_IZIPAY: false,
    PAYMENT_MULTIPLE: true,
    
    // Analíticas básicas
    ANALYTICS: true,
    ANALYTICS_ADVANCED: false,
    
    // Productos completos
    PRODUCT_REVIEWS: true,
    PRODUCT_WISHLIST: true,
    PRODUCT_VARIANTS: true,
    
    // Gestión completa
    STOCK_MANAGEMENT: true,
    STOCK_HISTORY: true,
    COUPONS: true,
    MULTIPLE_ADMINS: true,
    
    // Notificaciones por email
    EMAIL_NOTIFICATIONS: true,
    WHATSAPP_NOTIFICATIONS: false,
    
    // Algunos extras
    CUSTOM_BRANDING: false,
    API_ACCESS: false,
    PRIORITY_SUPPORT: false,
  },
  
  PREMIUM: {
    // IA avanzada ilimitada
    AI_CHAT: true,
    AI_CHAT_UNLIMITED: true,
    
    // Facturación SUNAT completa
    SUNAT_INVOICING: true,
    SUNAT_MULTIPLE_DOCS: true, // Facturas y boletas ilimitadas
    
    // Todos los métodos de pago
    PAYMENT_YAPE: true,
    PAYMENT_CULQI: true,
    PAYMENT_NIUBIZ: true,
    PAYMENT_IZIPAY: true,
    PAYMENT_MULTIPLE: true,
    
    // Analíticas avanzadas
    ANALYTICS: true,
    ANALYTICS_ADVANCED: true,
    
    // Productos completos
    PRODUCT_REVIEWS: true,
    PRODUCT_WISHLIST: true,
    PRODUCT_VARIANTS: true,
    
    // Gestión completa
    STOCK_MANAGEMENT: true,
    STOCK_HISTORY: true,
    COUPONS: true,
    MULTIPLE_ADMINS: true,
    
    // Notificaciones completas
    EMAIL_NOTIFICATIONS: true,
    WHATSAPP_NOTIFICATIONS: true,
    
    // Extras
    CUSTOM_BRANDING: true,
    API_ACCESS: false,
    PRIORITY_SUPPORT: true,
  },
  
  ENTERPRISE: {
    // Todo activado
    AI_CHAT: true,
    AI_CHAT_UNLIMITED: true,
    
    SUNAT_INVOICING: true,
    SUNAT_MULTIPLE_DOCS: true,
    
    PAYMENT_YAPE: true,
    PAYMENT_CULQI: true,
    PAYMENT_NIUBIZ: true,
    PAYMENT_IZIPAY: true,
    PAYMENT_MULTIPLE: true,
    
    ANALYTICS: true,
    ANALYTICS_ADVANCED: true,
    
    PRODUCT_REVIEWS: true,
    PRODUCT_WISHLIST: true,
    PRODUCT_VARIANTS: true,
    
    STOCK_MANAGEMENT: true,
    STOCK_HISTORY: true,
    COUPONS: true,
    MULTIPLE_ADMINS: true,
    
    EMAIL_NOTIFICATIONS: true,
    WHATSAPP_NOTIFICATIONS: true,
    
    CUSTOM_BRANDING: true,
    API_ACCESS: true,
    PRIORITY_SUPPORT: true,
  },
}

/**
 * Obtiene la configuración de features según el nivel del paquete
 * Por defecto usa 'STANDARD' si no está configurado
 */
export function getFeatures(): FeatureConfig {
  const level = (process.env.PACKAGE_LEVEL || 'STANDARD').toUpperCase() as PackageLevel
  
  if (!FEATURES[level]) {
    console.warn(`⚠️ Nivel de paquete desconocido: ${level}. Usando STANDARD por defecto.`)
    return FEATURES.STANDARD
  }
  
  return FEATURES[level]
}

/**
 * Verifica si una feature está habilitada
 */
export function isFeatureEnabled(feature: keyof FeatureConfig): boolean {
  const features = getFeatures()
  return features[feature] === true
}

/**
 * Obtiene el nivel de paquete actual
 */
export function getPackageLevel(): PackageLevel {
  const level = (process.env.PACKAGE_LEVEL || 'STANDARD').toUpperCase() as PackageLevel
  return FEATURES[level] ? level : 'STANDARD'
}

// Exportar configuración completa para uso en componentes
export const features = getFeatures()
export const packageLevel = getPackageLevel()

