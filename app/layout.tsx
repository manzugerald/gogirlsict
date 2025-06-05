import type { Metadata } from "next";
import {Inter, Roboto} from 'next/font/google';
import '@/assets/styles/globals.css';
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/lib/constants";
import { ThemeProvider } from "next-themes";

const inter = Inter({subsets: ['latin']});
//Configure Roboto
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['200','400']
})

export const metadata: Metadata = {
  title: {
    template: `%s | GoGirls ICT Initiative`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${roboto.className}  antialiased`}
      >
        <ThemeProvider 
          attribute='class' 
          defaultTheme="light" 
          enableSystem 
          disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
