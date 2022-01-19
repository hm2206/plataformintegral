import React, { useEffect } from 'react'
import App from 'next/app';
import { ScreenProvider } from '../contexts/ScreenContext';
import { AuthProvider } from '../contexts/AuthContext'; 
import Router from 'next/router';
import { AUTH } from '../services/auth';
import { authentication } from '../services/apis';
import moment from 'moment';
moment.locale('es');

// component utils
import Show from '../components/show';

// css
import '../styles/main.scss';
import 'react-toastify/dist/ReactToastify.css';

// context
import { AppProvider } from '../contexts';
import Cookies from 'js-cookie';


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
const IntegrationApp = ({ app, success, pageProps, Component, auth_token, pathname, query }) => {

	// propos components
	let appProps = { success, app, pathname, query }

	// recoveri token
	const recoveryToken = () => {
		let is_auth_token = Cookies.get('auth_token');
		let auth_token = localStorage.getItem('auth_token');
		if (!is_auth_token && auth_token) {
			Cookies.set('auth_token', auth_token);
			Router.push('/');
		}
	}

	// obtener token
	useEffect(() => {
		if (location) recoveryToken();
	}, [success]);
	
	// render
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

// static get initial props
IntegrationApp.getInitialProps = async ({ ctx, Component }) => {
	// calls page's `getInitialProps` and fills `appProps.pageProps`
	const pageProps = Component.getInitialProps && await Component.getInitialProps(ctx) || {};
	// obtener el app
	const { success, app } = await authentication.get('app/me')
		.then(res => res.data)
		.catch(err => {
			console.log(err);
			return ({ success: false, app: { state: 0, message: err.message } })
		});
	// obtener token
	const auth_token = await AUTH(ctx);
	// obtener pathname, query
	let { pathname, query } = ctx;
	// response 
	return { pageProps, success, app, auth_token, pathname, query };
}

// exportar
export default IntegrationApp;