import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
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