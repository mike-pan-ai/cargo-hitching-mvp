import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <style>{`
          @font-face {
            font-family: 'Berlin Type';
            src: url('/fonts/BerlinType-Regular.woff2') format('woff2'),
                 url('/fonts/BerlinType-Regular.woff') format('woff');
            font-weight: normal;
            font-style: normal;
          }

          @font-face {
            font-family: 'Berlin Type';
            src: url('/fonts/BerlinType-Bold.woff2') format('woff2'),
                 url('/fonts/BerlinType-Bold.woff') format('woff');
            font-weight: bold;
            font-style: normal;
          }

          .berlin-type-font {
            font-family: 'Berlin Type', Arial, sans-serif;
          }

          .berlin-type-bold {
            font-family: 'Berlin Type', Arial, sans-serif;
            font-weight: bold;
          }
        `}</style>

        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/png" href="/favicon-96x96-dark.png" sizes="96x96" media="(prefers-color-scheme: dark)" />
        <link rel="shortcut icon" href="/favicon-light.ico" media="(prefers-color-scheme: light)" />
        <link rel="shortcut icon" href="/favicon-dark.ico" media="(prefers-color-scheme: dark)" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}