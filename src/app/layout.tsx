import Footer from '@/components/Footer';
import { ConditionalNavigation } from '@/components/navigation/ConditionalNavigation';
import '@/styles/globals.css';
import { DynamicLayoutProviders } from './(dynamic-pages)/DynamicLayoutProviders';
import { ClientLayout } from './ClientLayout';

export const metadata = {
  title: 'Fazil',
  description: 'Sistema de gestión integral para comunidades de propietarios',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans" suppressHydrationWarning>
      <head />
      <body>
        <DynamicLayoutProviders>
          <div className="flex pt-2 flex-col min-h-screen bg-background text-foreground">
            <ConditionalNavigation />
            <ClientLayout>{children}</ClientLayout>
            <Footer />
          </div>
        </DynamicLayoutProviders>
      </body>
    </html>
  );
}
