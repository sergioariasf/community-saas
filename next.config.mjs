export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Marcar pdf-parse como paquete externo del servidor
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', 'canvas'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Permitir archivos hasta 10MB
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Fix para pdf-parse en producción
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        canvas: false,
      };

      // Marcar pdf-parse como server-only en el cliente
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdf-parse': false,
        'pdfjs-dist': false,
      };
    }

    return config;
  },
  // Configuración para deployment
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
};
