import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthProvider } from "@/components/layout/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "심플 배송 정산",
  description: "직관적인 초심플 배송 실적 및 정산 관리 앱",
  icons: {
    icon: '/icon-512.png',
    apple: '/icon-512.png',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <AuthProvider>
          <div className="max-w-md mx-auto min-h-[100dvh] bg-background relative shadow-sm overflow-x-hidden pb-16 flex flex-col">
            {children}
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
