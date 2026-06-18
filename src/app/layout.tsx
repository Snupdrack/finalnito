import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nito's Pizza - Menú Digital",
  description: "Explora nuestro menú digital y realiza tu pedido de manera rápida. Desarrollado por Cesar Garcia | synkdata.",
  keywords: ["Nitos Pizza", "Pizza", "Menú Digital", "Next.js", "React", "synkdata"],
  authors: [{ name: "Cesar Garcia | synkdata" }],
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "Nito's Pizza - Menú Digital",
    description: "Explora nuestro menú digital y realiza tu pedido de manera rápida. Desarrollado por Cesar Garcia | synkdata.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nito's Pizza - Menú Digital",
    description: "Explora nuestro menú digital y realiza tu pedido de manera rápida. Desarrollado por Cesar Garcia | synkdata.",
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="es" suppressHydrationWarning>
      <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
      {children}
      <Toaster />
      </body>
      </html>
  );
}