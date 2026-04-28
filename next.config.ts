import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Allow Next.js <Image> to load images from WordPress
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dev-bluerange.pantheonsite.io',
        pathname: '/**',
      },
      {
        // Fallback: allow any subdomain of pantheonsite.io
        protocol: 'https',
        hostname: '*.pantheonsite.io',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,   // ✅ Allow SVG images from WordPress
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async redirects() {
    // Swedish slugs used on /sv/ that might be hit with English slug (and vice versa)
    const slugMap: Record<string, string> = {
      // English slug → Swedish slug
      'virtual-server':                   'virtuell-server',
      's3-storage':                        's3-lagring',
      'infrastructure-as-a-service':       'infrastruktur-som-en-tjanst',
      'software-hosting-as-a-service':     'programvaruhosting-som-en-tjanst',
      'software-entrepreneurs':            'programvaruentreprenorer',
      'our-partners':                      'vara-partners',
      'web-hotel':                         'webbhotell',
      'web-hosting':                       'webbhotell',
      'domains':                           'domaner',
      'broadband':                         'bredband-se',
      'security-awareness-training':       'sakerhetsmedvetenhetsutbildning',
      'sercurity-awarness-training':       'sakerhetsmedvetenhetsutbildning',
      'public-sector':                     'offentlig-sektor',
      'about-bluerange':                   'om-bluerange',
      'about':                             'om-bluerange',
      'career':                            'karriar',
      'kubernetes-as-a-service':           'kubernetes-som-tjanst',
      'contact-us':                        'kontakta-oss',
      'news':                              'nyheter',
      'products':                          'produkter',
      'services':                          'tjanster',
    };

    const redirects = [];

    for (const [enSlug, svSlug] of Object.entries(slugMap)) {
      // /sv/english-slug → /sv/swedish-slug
      redirects.push({
        source: `/sv/${enSlug}`,
        destination: `/sv/${svSlug}`,
        permanent: true,
      });
      // /en/swedish-slug → /en/english-slug (reverse)
      redirects.push({
        source: `/en/${svSlug}`,
        destination: `/en/${enSlug}`,
        permanent: true,
      });
    }

    return redirects;
  },

  async rewrites() {
    return [
      {
        source: '/wp-content/:path*',
        destination: 'https://dev-bluerange.pantheonsite.io/wp-content/:path*',
      },
    ];
  },
};


export default nextConfig;


