import { Inter } from 'next/font/google';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import "./globals.css";
import AutoLogoutProvider from '@/components/AutoLogoutProvider'
import { ProfileProvider } from './contexts/ProfileContext'
import { FinancialConfigProvider } from '@/app/contexts/FinancialConfigContext'
import AIChatInterface from '@/components/AIChatInterface'
import { ToastProvider } from '@/components/ui/toast'
import ImpersonationBanner from '@/components/admin/ImpersonationBanner'
import GlobalBanner from '@/components/GlobalBanner'

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Prificient',
  description: 'Finansal Veri Yönetimi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AutoLogoutProvider> {/* <--- EN DIŞ KATMANA EKLEDIK */}
          <CurrencyProvider>
            <PreferencesProvider>
              <ProfileProvider>
                <FinancialConfigProvider>
                  <ToastProvider>
                    <GlobalBanner />
                    <ImpersonationBanner />
                    {children}
                    <AIChatInterface />
                  </ToastProvider>
                </FinancialConfigProvider>
              </ProfileProvider>
            </PreferencesProvider>
          </CurrencyProvider>
        </AutoLogoutProvider>
      </body>
    </html>
  );
}