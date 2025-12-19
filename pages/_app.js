import React, { useEffect, useState } from 'react'
import { ScreenProvider } from '../contexts/ScreenContext';
import { AuthProvider } from '../contexts/AuthContext';
import Router, { useRouter } from 'next/router';
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
	if (loadingBrand) loadingBrand.style.display = 'block';
}

// state pages
Router.onRouteChangeComplete = () => {
	let loadingBrand = document.getElementById('loading-brand');
	if (loadingBrand) loadingBrand.style.display = 'none';
}

Router.onRouteChangeError = () => {
	let loadingBrand = document.getElementById('loading-brand');
	if (loadingBrand) loadingBrand.style.display = 'none';
}


// app main
const IntegrationApp = ({ Component, pageProps }) => {
	const router = useRouter();
	const { pathname, query } = router;

	// estados
	const [app, setApp] = useState({});
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(true);
	const [auth_token, setAuthToken] = useState("");

	// props components
	let appProps = { success, app, pathname, query }

	// recoveri token
	const recoveryToken = () => {
		let is_auth_token = Cookies.get('auth_token');
		let stored_token = localStorage.getItem('auth_token');
		if (!is_auth_token && stored_token) {
			Cookies.set('auth_token', stored_token);
			Router.push('/');
		}
	}

	// cargar datos de la app
	const fetchApp = async () => {
		setLoading(true);
		await authentication.get('app/me')
			.then(res => {
				setSuccess(res.data.success);
				setApp(res.data.app || {});
			})
			.catch(err => {
				console.log(err);
				setSuccess(false);
				setApp({ state: 0, message: err.message });
			});
		// obtener token
		const token = AUTH();
		setAuthToken(token);
		setLoading(false);
	}

	// obtener token y app al montar
	useEffect(() => {
		recoveryToken();
		fetchApp();
	}, []);

	// loading
	if (loading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
				<div>Cargando...</div>
			</div>
		);
	}

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

// exportar
export default IntegrationApp;
