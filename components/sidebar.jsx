import React, { useContext, useState } from "react";
import Link from "next/link";
import Navigation from "./navigation";
import { AppContext } from "../contexts";
import { ScreenContext } from "../contexts/ScreenContext";
import { AuthContext } from "../contexts/AuthContext";
import { SocketContext } from "../contexts/SocketContext";
import { cn } from '@/lib/utils';

const Sidebar = () => {
	// screen
	const { toggle, fullscreen } = useContext(ScreenContext);

	// app
	const { app, pathname } = useContext(AppContext);

	// auth
	const auth_context = useContext(AuthContext);
	const { auth } = auth_context;

	// socket
	const { online } = useContext(SocketContext);

	// mobile dropdown state
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<aside
			className={cn(
				"app-aside app-aside-expand-md app-aside-light",
				toggle && 'show',
				fullscreen && 'tw-hidden'
			)}
		>
			<div className="aside-content">
				{/* Header móvil */}
				<header className="aside-header d-block d-md-none">
					<button
						className="btn-account"
						type="button"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						<span className="user-avatar">
							<img
								src={auth?.image_images?.image_50x50 || auth?.image || '/img/perfil.jpg'}
								alt={auth?.person?.fullname || 'Usuario'}
							/>
							<span className={cn("avatar-badge", online ? 'online' : 'offline')}></span>
						</span>
						<span className="account-summary">
							<span className="account-name">{!auth_context.loading ? auth?.username || "Usuario" : 'Cargando...'}</span>
							<span className="account-description">{!auth_context.loading ? auth?.person?.fullname || "" : '...'}</span>
						</span>
					</button>

					{/* Mobile dropdown */}
					<div className={cn("dropdown-menu", mobileMenuOpen && "show")}>
						<div className="dropdown-arrow"></div>
						<Link href={{ pathname: '/notify', query: { tab: 'all_notify' } }} className="dropdown-item">
							<i className="fas fa-bell mr-2"></i> Notificaciones
						</Link>
						<Link href="/" className="dropdown-item">
							<i className="fas fa-user mr-2"></i> Mi Perfil
						</Link>
						<div className="dropdown-divider"></div>
						<button className="dropdown-item text-danger" onClick={() => auth_context.logout()}>
							<i className="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
						</button>
					</div>
				</header>

				{/* Menu */}
				<div className="aside-menu overflow-hidden perfect-scrollbar">
					<nav id="stacked-menu" className="stacked-menu">
						<ul className="menu">
							<li className={cn("menu-item", pathname === '/' && 'has-active')}>
								<Link href="/" className="menu-link">
									<span className="menu-icon fas fa-user"></span>
									<span className="menu-text">Perfil</span>
								</Link>
							</li>
							<Navigation/>
						</ul>
					</nav>
				</div>

				{/* Footer */}
				<footer className="aside-footer border-top p-2">
					<a
						href={app?.support_link || "#"}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-primary btn-block"
					>
						<i className="fas fa-headset mr-1"></i>
						Soporte: {app?.support_name || "Técnico"}
					</a>
				</footer>
			</div>
		</aside>
	);
}

export default Sidebar;
