import React, { useContext } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { AppContext } from '../contexts/AppContext';

const AppHeader = () => {

    const { app } = useContext(AppContext);

    // response
    return (
       <>
           <Head>
                <meta charSet="utf-8"></meta>
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"></meta>
                <title>{app.name || "Integración"}</title>
                <link rel="shortcut icon" href={app?.icon_images?.icon_50x50}></link>
                <meta name="theme-color" content="#3063A0"></meta>
           </Head>

           {/* Scripts adicionales - jQuery/Popper/Bootstrap están en _document.js */}
           <Script src="/js/stacked-menu.min.js" strategy="afterInteractive" />
           <Script src="/js/theme.min.js" strategy="afterInteractive" />
       </>
    );
}

export default AppHeader;