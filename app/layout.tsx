import type React from "react"
import type { Metadata, Viewport } from "next"
import { ZCOOL_KuaiLe } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const zcoolKuaiLe = ZCOOL_KuaiLe({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "萌芽生词王 - 一年级生词辅导",
  description: "专为小学一年级学生设计的趣味汉字学习工具",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7CC47C",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${zcoolKuaiLe.className} antialiased min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
