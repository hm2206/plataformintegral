import React, { Fragment, useContext } from "react";
import Navigation from "./navigation";
import Router from 'next/router';
import { AppContext } from "../contexts";
import { ScreenContext } from "../contexts/ScreenContext";
import { AuthContext } from "../contexts/AuthContext";
import { SocketContext } from "../contexts/SocketContext";


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

	// render
	return (
		<Fragment>   
			<aside className={`app-aside app-aside-expand-md app-aside-light ${toggle ? 'show' : ''}`} style={{ display: fullscreen ? 'none' : 'block' }}>
				<div className="aside-content">
					<header className="aside-header d-block d-md-none">
						<button
							className="btn-account"
							type="button"
							data-toggle="collapse"
							data-target="#dropdown-aside"
						>
							<span className="user-avatar user-avatar-lg">
								<img src={auth.image ? auth.image && auth.image_images && auth.image_images.image_50x50 : '/img/.jpg'} 
									alt={auth.person && auth.person.fullname} 
								/>
								<span className={`avatar-badge ${online ? 'online' : 'offline'}`} title={online ? 'online' : 'offline'}/>
							</span>{" "}
							<span className="account-icon">
								<span className="fa fa-caret-down fa-lg"></span>
							</span>{" "}
							<span className="account-summary">
								<span className="account-name">{!auth_context.loading ? auth.username || "" : 'fetching...'}</span>{" "}
								<span className="account-description">{!auth_context.loading ? auth.person && auth.person.fullname || "" : 'fetching...'}</span>
							</span>
						</button>

						<div id="dropdown-aside" className="dropdown-aside collapse">
							<div className="pb-3">
								<a className="dropdown-item" href="#"
									onClick={(e) => {
										e.preventDefault();
										Router.push({ pathname: '/notify', query: { tab: 'all_notify' } });
									}}
								>
									<span className="fas fa-bell"></span> Notificaciones
								</a>{" "}
								
								<a className="dropdown-item" href="/">
									<span className="fas fa-user"></span> Perfil
								</a>{" "}

								<a className="dropdown-item" href="#" 
									onClick={(e) => {
										e.preventDefault();
										auth_context.logout();
									}}
								>
									<span className="fas fa-sign"></span>{" "}
									Cerrar Sesión
								</a>
							</div>
						</div>
					</header>
					{/* menu lateral version desktop */}
					<div className="aside-menu --overflow-hidden">
						<nav id="stacked-menu" className="stacked-menu">
							<ul className="menu">
								<li className={`menu-item ${pathname == '/' ? 'has-active' : ''}`}>
									<a className="menu-link"
										href="/"
									>
										<span className="menu-icon fas fa-user"></span>{" "}
										<span className="menu-text">Perfil</span>
									</a>
								</li>
								<Navigation/>
							</ul>
						</nav>
					</div>
					{/* pie de página */}
					<footer className="aside-footer border-top p-3">
						<a className="text-dark text-center" 
							href={app.support_link || ""} 
							target="_blank"
						>
							<b className="badge badge-dark w-100">Soporte: {app.support_name || ""}</b>
						</a>
					</footer>
				</div>
			</aside>
		</Fragment>
	);
}

export default Sidebar;