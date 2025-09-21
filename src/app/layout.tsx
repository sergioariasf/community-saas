import Footer from '@/components/Footer';
import '@/styles/globals.css';
import { ClientLayout } from './ClientLayout';
import { ConditionalNavigation } from '@/components/navigation/ConditionalNavigation';

export const metadata = {
  title: 'Fazil - Community Management',
  description: 'Sistema de gestión integral para comunidades de propietarios',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans">
      <head />
      <body>
        <div className="flex pt-2 flex-col min-h-screen bg-white dark:bg-gray-900">
          <ConditionalNavigation />
          <ClientLayout>{children}</ClientLayout>
          <Footer />
        </div>
      </body>
    </html>
  );
}
