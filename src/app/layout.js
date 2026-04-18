import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";
import { getSettings } from "@/lib/setting";
import { SettingsProvider } from "@/settings/settingsProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const s = await getSettings();
  const favicon = s?.favicon;

  return {
    title: `${s?.companyName || ""}${s?.payoff ? ` ${s.payoff}` : ""}`,
    description: s?.poweredBy || "",
    icons: {
      icon: favicon || undefined,
      shortcut: favicon || undefined,
      apple: favicon || undefined,
    },
  };
}

export default async function RootLayout({ children }) {
  const s = await getSettings();

  const brand = s?.colorBrand || "oklch(0.62 0.24 25)";
  const brandForeground = s?.colorBrandContrast || "oklch(0.98 0 0)";

  return (
    <html lang={s?.language || "it"} suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} style={{ "--brand": brand, "--brand-foreground": brandForeground }}>
        <SettingsProvider initialSettings={s}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </SettingsProvider>
        <Toaster />
      </body>
    </html>
  );
}