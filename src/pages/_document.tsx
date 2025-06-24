import { Html, Head, Main, NextScript } from "next/document";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Document() {
  return (
    <Html lang="en" className={inter.className}>
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
