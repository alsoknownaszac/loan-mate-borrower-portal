import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AlertDialogProvider } from "@/components/ui/alert-dialog"

import { Archivo as V0_Font_Archivo, Geist_Mono as V0_Font_Geist_Mono, Exo_2 as V0_Font_Exo_2 } from 'next/font/google'

// Initialize fonts
const _archivo = V0_Font_Archivo({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _exo_2 = V0_Font_Exo_2({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })

export const metadata: Metadata = {
  title: "LoanMate - Borrower Portal",
  description: "Manage your loans, payments, and documents with ease",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AlertDialogProvider>
          {children}
        </AlertDialogProvider>
        <Analytics />
      </body>
    </html>
  )
}
