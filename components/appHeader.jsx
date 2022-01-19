import React, { useContext } from 'react';
import Head from 'next/head';
import { AppContext } from '../contexts/AppContext';

const AppHeader = () => {

    const { app } = useContext(AppContext);

    // response
    return (
       <Head>
            <meta charSet="utf-8"></meta>
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"></meta>
            {/* titulo */}
            <title>{app.name || "Integración"}</title>
            <link rel="shortcut icon" href={app?.icon_images?.icon_50x50}></link>
            <meta name="theme-color" content="#3063A0"></meta>
            <link href="https://fonts.googleapis.com/css?family=Roboto:400,300,100,500,600,700,900" rel="stylesheet" type="text/css" />
            <link rel="stylesheet" href="/css/open-iconic-bootstrap.min.css" />
            <link rel="stylesheet" href="/css/all.css" />
            <link rel="stylesheet" href="/css/buttons.bootstrap4.min.css"></link>
            <link rel="stylesheet" href="/css/flatpickr.min.css" />
            <link rel="stylesheet" href="/css/theme.min.css" data-skin="default" />
            <link rel="stylesheet" href="/css/theme-dark.min.css" data-skin="dark" disabled={true} />
            <link rel="stylesheet" href="/css/skull.css" />

            <script src="/js/jquery.min.js"></script>
            <script src="/js/popper.min.js"></script>
            <script src="/js/bootstrap.min.js"></script>
            {/* css dinamico */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.2/semantic.min.css" />
            <link rel="stylesheet" href="/css/page_loading.css" />
            {/* {<link rel="stylesheet" href="/css/no_auth_page_loading.css" />} */}
            {/* custom */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <link rel="stylesheet" href="/css/custom.css" />

            {/* link excel */}
            <link rel="stylesheet" href="/css/excel.css" />

            {/* WPA */}
            {/* <link rel="manifest" href="/manifest.json" />
            <link href='/favicon-16x16.png' rel='icon' type='image/png' sizes='16x16' />
            <link href='/favicon-32x32.png' rel='icon' type='image/png' sizes='32x32' />
            <link rel="apple-touch-icon" href="/apple-icon.png"></link>
            <meta name="theme-color" content="#346cb0"/> */}
            <script src="/js/stacked-menu.min.js"></script>
            <script src="/js/theme.min.js"></script>
       </Head> 
    );
}

export default AppHeader;