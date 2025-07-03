import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/providers/ConvexClientProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Chat App",
  description: "Realtime chat app using NextJs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <ConvexClientProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <Toaster richColors />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
