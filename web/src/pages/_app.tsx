import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Booyahesports | India's Premier Free Fire MAX Tournament Arena</title>
        <meta name="description" content="Join 100% free Free Fire MAX Solo, Duo, and Squad esports scrims and tournaments. Automated custom room management and live leaderboards on Booyahesports.in." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
