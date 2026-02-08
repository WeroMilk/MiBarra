import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#6366F1",
};

export const metadata: Metadata = {
  title: "MiBarra - Gestión de Bar",
  description: "Control de inventario de botellas y cervezas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full w-full overflow-hidden">
      <body className={`${inter.variable} ${poppins.variable} font-sans h-full w-full overflow-hidden`}>
        {/* Suprimir mensajes de desarrollo y ruido en consola */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                var oLog = console.log, oWarn = console.warn, oInfo = console.info, oError = console.error;
                var skip = function(msg) {
                  if (typeof msg !== 'string') return false;
                  return /React DevTools|Fast Refresh|preload.*layout\\.css|Modo DEMO|Content Security Policy|ERR_EMPTY_RESPONSE|Failed to load resource/i.test(msg);
                };
                console.log = function() { if (!skip(arguments[0])) oLog.apply(console, arguments); };
                console.warn = function() { if (!skip(arguments[0])) oWarn.apply(console, arguments); };
                console.info = function() { if (!skip(arguments[0])) oInfo.apply(console, arguments); };
                console.error = function() { if (!skip(arguments[0])) oError.apply(console, arguments); };
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
