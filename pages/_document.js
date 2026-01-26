import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="es">
            <Head>
                {/* Fuentes */}
                <link href="https://fonts.googleapis.com/css?family=Roboto:400,300,100,500,600,700,900" rel="stylesheet" type="text/css" />

                {/* Stylesheets */}
                <link rel="stylesheet" href="/css/open-iconic-bootstrap.min.css" />
                <link rel="stylesheet" href="/css/all.css" />
                <link rel="stylesheet" href="/css/buttons.bootstrap4.min.css" />
                <link rel="stylesheet" href="/css/flatpickr.min.css" />
                <link rel="stylesheet" href="/css/theme.min.css" data-skin="default" />
                <link rel="stylesheet" href="/css/theme-dark.min.css" data-skin="dark" disabled={true} />
                <link rel="stylesheet" href="/css/skull.css" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.2/semantic.min.css" />
                <link rel="stylesheet" href="/css/page_loading.css" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
                <link rel="stylesheet" href="/css/custom.css" />
                <link rel="stylesheet" href="/css/excel.css" />

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
