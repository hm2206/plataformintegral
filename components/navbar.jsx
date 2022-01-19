import React, { Fragment, useContext } from "react";
import dynamic from 'next/dynamic';
import SkullAuth from "../components/loaders/skullAuth";
import Logo from "../components/logo";
import Show from "./show";
import Cookies from 'js-cookie';
import Router from "next/router";
import Link from "next/link";
import { Confirm } from '../services/utils';
import { AppContext } from "../contexts";
import { SelectEntityUser } from '../components/select/authentication';
import { ScreenContext } from '../contexts/ScreenContext';
import { AuthContext } from "../contexts/AuthContext";
import { EntityContext } from "../contexts/EntityContext";
import { SocketContext } from "../contexts/SocketContext";

const Notification = dynamic(() => import('./notification'), { ssr: false });
const extendView = ['medium', 'long', 'x-long'];


const Navbar = () => {

	// screen context
	const { mode, toggle, setToggle, fullscreen, setFullscreen } = useContext(ScreenContext);

	// auth context
	const auth_context = useContext(AuthContext);

	// socket context
	const { online } = useContext(SocketContext);

	// entity context
	const { entity_id, setEntityId, render, disabled } = useContext(EntityContext);

	// entity default
	const entityDefault = (options = []) => {
		let count = options.length;
		if (!entity_id && count >= 2) handleEntity({ value: options[1].value });
	}

	// seleccionar entidad
	const handleEntity = async ({ value }) => {
		setEntityId(value);
		Cookies.set('EntityId', value);
		let { push, pathname, query } = Router;
		push({ pathname, query });
	}

	// refrescar página
	const handleRefreshPage = async (e) => {
		e.preventDefault();
		let answer = await Confirm(`warning`, '¿Estás seguro en actualizar la página?', 'Actualizar');
		if (answer) location.href = location.href;
	}

	// renderizar
    return (
		<Fragment>
			<header className={`app-header app-header-dark bg-default`}>
				<div className="top-bar">
					<div className="top-bar-brand" 
						style={{ display: fullscreen || !extendView.includes(mode) ? 'none' : 'flex' }}
					>
						<a href="/">
							<Logo/>
						</a>
					</div>

					<div className="top-bar-list">
						<Show condicion={extendView.includes(mode)}>
							<div className="top-bar-item px-2">
								<button className="btn text-white"
									style={{ fontSize: '1.15em' }}
									onClick={(e) => setFullscreen(!fullscreen)}
								>
									<i className={`fas fa-${fullscreen ? 'times' : 'bars'}`}></i>
								</button>
							</div>
						</Show>

						<Show condicion={!auth_context.loading && render}>
							<div className="col-md-5 capitalize">
							<SelectEntityUser
								user_id={auth_context.auth && auth_context.auth.id}
								value={entity_id}
								name="entity_id"
								disabled={disabled}
								onChange={(e, obj) => handleEntity(obj)}
								onReady={entityDefault}
							/>
							</div>
						</Show>
					
						<div className="top-bar-item px-2 d-md-none d-lg-none d-xl-none">
							<button
								className={`hamburger hamburger-squeeze ${toggle ? 'active' : ''}`}
								type="button"
								data-toggle="aside"
								aria-label="toggle menu"
								onClick={(e) => setToggle(!toggle)}
							>
								<span className="hamburger-box">
									<span className="hamburger-inner"></span>
								</span>
							</button>
						</div>

						<div className="top-bar-item top-bar-item-right px-0 d-none d-sm-flex">
							<ul className="header-nav nav">
								<Show condicion={extendView.includes(mode)}>
									<li className="nav-item">
										<a href="" 
											className="nav-link" 
											onClick={handleRefreshPage}
										>
											<i className="fas fa-sync"></i>
										</a>
									</li>
								</Show>
								{/* notificaciones */}
								<Notification/>
							</ul>

							<div className="dropdown d-flex">
								<Show condicion={!auth_context.loading}
									predeterminado={<SkullAuth />}
								>
									<button
										className="btn-account d-none d-md-flex"
										type="button"
										data-toggle="dropdown"
										aria-haspopup="true"
										aria-expanded="false"
									>
										<span className="user-avatar user-avatar-md">
											<img src={
													auth_context.auth && auth_context.auth.image_images &&auth_context.auth.image_images.image_50x50 || 
													auth_context.auth && auth_context.auth.image || 
													'/img/perfil.jpg'
												}
												alt="perfil"
												style={{ background: '#fff' }}
											/>
											<span className={`avatar-badge ${online ? 'online' : 'offline'}`} title={online ? 'online' : 'offline'}/>
										</span>{" "}
										<span className="account-summary pr-lg-4 d-none d-lg-block">
											<span className="account-name" style={{ textTransform: 'capitalize' }}>
												{auth_context.auth && auth_context.auth.username || ""}
											</span>{" "}
											<span className="account-description">
												{auth_context.auth && auth_context.auth && auth_context.auth.email || ""}
											</span>
										</span>
									</button>
								</Show>

								<div className="dropdown-menu">
								
								<div className="dropdown-arrow ml-3"></div>

								<h6 className="dropdown-header d-none d-md-block d-lg-none">
									{auth_context.auth && auth_context.auth.username || ""}
								</h6>

								<a className="dropdown-item" href="/">
									<span className="fas fa-user"></span>{" "}
									Perfil
								</a>{" "}

								<Link href="/docs">
									<a className="dropdown-item">
										<span className="fas fa-info-circle"></span>{" "}
										Ayuda
									</a>
								</Link>

									<a href="#logout"
										className="dropdown-item"
										onClick={(e) => {
											e.preventDefault();
											auth_context.logout();
										}}
									>
										<span className="fas fa-sign"></span>{" "}
										Cerrar Cuenta
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>
		</Fragment>
    );
}

export default Navbar;