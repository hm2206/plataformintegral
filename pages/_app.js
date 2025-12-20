import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic';
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


// config router - solo en cliente
if (typeof window !== 'undefined') {
	Router.events.on('routeChangeStart', () => {
		let loadingBrand = document.getElementById('loading-brand');
		if (loadingBrand) loadingBrand.style.display = 'block';
	});

	Router.events.on('routeChangeComplete', () => {
		let loadingBrand = document.getElementById('loading-brand');
		if (loadingBrand) loadingBrand.style.display = 'none';
	});

	Router.events.on('routeChangeError', () => {
		let loadingBrand = document.getElementById('loading-brand');
		if (loadingBrand) loadingBrand.style.display = 'none';
	});
}


// app main - solo cliente
const IntegrationApp = ({ Component, pageProps }) => {
	const router = useRouter();
	const { pathname, query } = router;

	// estado para saber si estamos en el cliente
	const [isClient, setIsClient] = useState(false);
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
			location.href = '/';
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

	// detectar cliente y cargar datos
	useEffect(() => {
		setIsClient(true);
		recoveryToken();
		fetchApp();
	}, []);

	// Loader component reutilizable
	const AppLoader = () => (
		<>
			<style>{`
				@keyframes appSpin {
					to { transform: rotate(360deg); }
				}
				@keyframes appFade {
					0%, 100% { opacity: 0.4; }
					50% { opacity: 1; }
				}
			`}</style>
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
				fontFamily: "'Roboto', sans-serif",
			}}>
				<div style={{
					position: 'relative',
					width: '56px',
					height: '56px',
					marginBottom: '24px'
				}}>
					<div style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						border: '3px solid #e2e8f0',
						borderTopColor: '#346cb0',
						borderRadius: '50%',
						animation: 'appSpin 0.8s linear infinite'
					}} />
					<div style={{
						position: 'absolute',
						width: '65%',
						height: '65%',
						top: '17.5%',
						left: '17.5%',
						border: '3px solid #e2e8f0',
						borderBottomColor: '#5a8fd8',
						borderRadius: '50%',
						animation: 'appSpin 1.2s linear infinite reverse'
					}} />
				</div>
				<p style={{
					margin: 0,
					fontSize: '15px',
					color: '#64748b',
					fontWeight: '500',
					animation: 'appFade 1.5s ease-in-out infinite'
				}}>
					Cargando...
				</p>
			</div>
		</>
	);

	// Mostrar loader mientras no esté en cliente o esté cargando
	if (!isClient || loading) {
		return <AppLoader />;
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
