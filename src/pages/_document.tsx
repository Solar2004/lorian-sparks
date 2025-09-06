import { Head, Html, Main, NextScript } from 'next/document';
import { env } from '../env';

const { host } = new URL(env.NEXT_PUBLIC_SPARK_BASE_URL);

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <meta charSet="utf-8" />
                <meta name="theme-color" content="#335fa0" />
                <meta
                    name="description"
                    content="Lorian Sparks is a performance profiler for Minecraft clients, servers, and proxies with integrated bot analysis and advanced optimization recommendations."
                />
                {/* Favicon configuration */}
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="32x32" href="/assets/logo-128.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/assets/logo-128.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="/assets/logo-512.png" />
                
                {/* Apple touch icon */}
                <link rel="apple-touch-icon" sizes="180x180" href="/assets/logo-160.png" />
                
                {/* Additional favicons for different contexts */}
                <link rel="shortcut icon" href="/favicon.ico" />
                
                {/* Web App Manifest */}
                <link rel="manifest" href="/manifest.json" />

                {host === 'spark.lucko.me' && (
                    <script
                        async
                        defer
                        data-domain="spark.lucko.me"
                        src="https://plausible.lucko.me/js/pl.js"
                    />
                )}
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
