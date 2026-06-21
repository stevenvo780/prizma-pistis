import Document, { Html, Head, Main, NextScript } from 'next/document';

// Use environment variable for site URL, fallback to prod default
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pistis.prizmacorp.cloud';
const TITLE = 'Pistis — Crédito y Cartera | Prizma';
const DESCRIPTION =
  'Gestiona tu cartera de crédito, cobros y financiamiento empresarial con Pistis, el módulo financiero de la suite Prizma.';
const OG_IMAGE = `${BASE_URL}/img/og-pistis.png`;

class MyDocument extends Document {
  render() {
    return (
      <Html lang="es" data-theme="light">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/img/icon.png" sizes="200x200" />

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
        </Head>
        <body data-module="pistis">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
