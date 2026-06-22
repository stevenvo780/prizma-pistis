import Document, { Html, Head, Main, NextScript } from 'next/document';
import { SITE_URL as BASE_URL } from '../config/site';
const TITLE = 'Pistis — Plataforma de Crédito Empresarial | Prizma';
const DESCRIPTION =
  'Gestiona tu cartera de crédito, cobros y financiamiento empresarial con Pistis, el módulo de crédito sin interés de la suite Prizma.';
const OG_IMAGE = `${BASE_URL}/og-image.png`;
const OG_IMAGE_ALT = 'Pistis — Plataforma de crédito empresarial sin interés por Prizma';

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Pistis',
  alternateName: 'Prizma Pistis',
  url: BASE_URL,
  description: DESCRIPTION,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'COP',
    description: 'Plan básico gratuito. Planes de pago desde $30.000 COP/mes.',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Prizma',
    url: 'https://prisma-enterprise.cloud',
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/img/prizma-symbol.svg`,
    },
  },
};

class MyDocument extends Document {
  render() {
    return (
      <Html lang="es" data-theme="light">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          {/* Favicon multi-size — Prizma Pistis brand */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon/v1_32.png" />
          <link rel="icon" type="image/png" sizes="180x180" href="/favicon/v2_180.png" />
          <link rel="apple-touch-icon" sizes="512x512" href="/favicon/v3_512.png" />

          {/* Web App Manifest */}
          <link rel="manifest" href="/manifest.json" />

          {/* Theme color — Prizma teal */}
          <meta name="theme-color" content="#43b5a6" />

          {/* SEO básico */}
          <title>{TITLE}</title>
          <meta name="description" content={DESCRIPTION} />
          <meta name="robots" content="index,follow" />
          <link rel="canonical" href={BASE_URL} />

          {/* Open Graph */}
          <meta property="og:title" content={TITLE} />
          <meta property="og:description" content={DESCRIPTION} />
          <meta property="og:url" content={BASE_URL} />
          <meta property="og:image" content={OG_IMAGE} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={OG_IMAGE_ALT} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Pistis" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={TITLE} />
          <meta name="twitter:description" content={DESCRIPTION} />
          <meta name="twitter:image" content={OG_IMAGE} />
          <meta name="twitter:image:alt" content={OG_IMAGE_ALT} />

          {/* JSON-LD Schema.org */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
