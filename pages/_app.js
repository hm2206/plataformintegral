import React from 'react'
import App from 'next/app';
import env from '../env.json';
import { ScreenProvider } from '../contexts/ScreenContext';
import { AuthProvider } from '../contexts/AuthContext'; 
import Router from 'next/router';
import { AUTH } from '../services/auth';
import { authentication } from '../services/apis';

// component utils
import Show from '../components/show';

// css
import 'react-vertical-timeline-component/style.min.css';
import { AppProvider } from '../contexts';


// config router
Router.onRouteChangeStart = () => {
	let loadingBrand = document.getElementById('loading-brand');
	loadingBrand.style.display = 'block';
}
  
// state pages
Router.onRouteChangeComplete = () => {
	let loadingBrand = document.getElementById('loading-brand');
	loadingBrand.style.display = 'none';
}
  
Router.onRouteChangeError = () => {
	let loadingBrand = document.getElementById('loading-brand');
	loadingBrand.style.display = 'none';
}


// app main
class IntegrationApp extends App {

	// get initialProps
	static getInitialProps = async ({ ctx, Component }) => {
		// calls page's `getInitialProps` and fills `appProps.pageProps`
		const pageProps = Component.getInitialProps && await Component.getInitialProps(ctx) || {};
		// obtener el app
		const { success, app } = await authentication.get('app/me')
			.then(res => res.data)
			.catch(err => ({ success: false, app: {} }));
		// obtener token
		const auth_token = await AUTH(ctx);
		// obtener pathname, query
		let { pathname, query } = ctx;
		// response 
		return { pageProps, success, app, auth_token, pathname, query };
	}

	// render
	render() {

		// props
		let { app, success, pageProps, Component, auth_token, pathname, query } = this.props;
		let appProps = { success, app, env, pathname, query }

		return (
			<ScreenProvider>
				<AppProvider {...appProps}>
					{/* auth */}
					<Show condicion={auth_token}>
						<AuthProvider>
							<Component {...pageProps}/>
						</AuthProvider>
					</Show>
					{/* Guest */}
					<Show condicion={!auth_token}>
						<Component {...pageProps}/>
					</Show>
				</AppProvider>
			</ScreenProvider>
		)
	}
};

// exportar
export default IntegrationApp;