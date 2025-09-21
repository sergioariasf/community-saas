// do not cache this layout
export const dynamic = 'force-dynamic';

export const metadata = {
  icons: {
    icon: '/images/favicon.svg',
  },
  title: 'Fazil - Community Management',
  description: 'Sistema de gestión integral para comunidades de propietarios',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
