import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="es">
            <Head>
                {/* jQuery debe cargarse antes que Bootstrap - orden garantizado */}
                <script src="/js/jquery.min.js" />
                <script src="/js/popper.min.js" />
                <script src="/js/bootstrap.min.js" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
