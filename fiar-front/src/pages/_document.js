import Document, { Html, Head, Main, NextScript } from 'next/document';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fiar.humanizar.cloud';
const TITLE = 'Iris — Sistema de Crédito sin Interés | Prizma';
const DESCRIPTION =
  'Gestiona tu cartera de crédito, cobros y financiamiento empresarial con Iris, el módulo de crédito sin interés de la suite Prizma.';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

class MyDocument extends Document {
  render() {
    return (
      <Html lang="es" data-theme="light">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          {/* Favicon multi-size */}
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
          <link rel="icon" type="image/png" sizes="180x180" href="/favicon-180.png" />
          <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png" />

          {/* Theme color — Iris brand */}
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
          <meta property="og:type" content="website" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={TITLE} />
          <meta name="twitter:description" content={DESCRIPTION} />
          <meta name="twitter:image" content={OG_IMAGE} />
        </Head>
        <body data-module="iris">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
