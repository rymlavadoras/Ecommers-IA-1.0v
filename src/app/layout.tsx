import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-commerce Perú | Ropa, Electrónica y Alimentos",
  description: "Tu tienda online de confianza en Perú. Encuentra ropa, electrónica, alimentos y más. Paga con Yape, tarjetas y más métodos. Facturación electrónica SUNAT.",
  keywords: ["ecommerce peru", "tienda online", "ropa", "electronica", "alimentos", "yape", "facturacion electronica"],
  authors: [{ name: "Tu Empresa SAC" }],
  openGraph: {
    title: "E-commerce Perú | Ropa, Electrónica y Alimentos",
    description: "Tu tienda online de confianza en Perú",
    type: "website",
    locale: "es_PE",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'tu-codigo-de-verificacion-google',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PE" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

