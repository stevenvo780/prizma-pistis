import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html data-theme="light">
        <Head>
          <link rel="icon" href="/img/icon.png" sizes="200x200" />
        </Head>
        <body data-module="fiar">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
