import React, { useContext, useState } from "react";
import Link from "next/link";
import Navigation from "./navigation";
import Router from 'next/router';
import { AppContext } from "../contexts";
import { ScreenContext } from "../contexts/ScreenContext";
import { AuthContext } from "../contexts/AuthContext";
import { SocketContext } from "../contexts/SocketContext";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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

	// get initials
	const getInitials = (name) => {
		if (!name) return 'U';
		return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
	};

	return (
		<aside
			className={cn(
				"app-aside app-aside-expand-md app-aside-light",
				"tw-bg-white tw-border-r tw-border-gray-100 tw-w-56 tw-transition-all tw-duration-300 tw-shadow-sm",
				toggle && 'show',
				fullscreen ? 'tw-hidden' : 'tw-block'
			)}
		>
			<div className="tw-flex tw-flex-col tw-h-full">
				{/* Header móvil */}
				<header className="d-block d-md-none tw-p-3 tw-border-b tw-border-gray-100 tw-bg-gradient-to-br tw-from-gray-50 tw-to-white">
					<button
						className="tw-flex tw-items-center tw-gap-3 tw-w-full tw-p-2.5 tw-bg-gray-50/80 tw-rounded-xl tw-cursor-pointer tw-transition-all tw-duration-200 tw-border-0 hover:tw-bg-gray-100"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						<div className="tw-relative">
							<Avatar className="tw-w-10 tw-h-10 tw-border-2 tw-border-gray-200">
								<AvatarImage
									src={auth?.image_images?.image_50x50 || auth?.image || '/img/perfil.jpg'}
									alt={auth?.person?.fullname || 'Usuario'}
								/>
								<AvatarFallback className="tw-bg-primary-500 tw-text-white tw-text-sm">
									{getInitials(auth?.username)}
								</AvatarFallback>
							</Avatar>
							<span className={cn(
								"tw-absolute tw-bottom-0 tw-right-0 tw-w-2.5 tw-h-2.5 tw-rounded-full tw-border-2 tw-border-white",
								online ? 'tw-bg-green-500' : 'tw-bg-gray-400'
							)}></span>
						</div>
						<div className="tw-flex-1 tw-text-left">
							<div className="tw-text-sm tw-font-semibold tw-text-gray-900">
								{!auth_context.loading ? auth?.username || "Usuario" : 'Cargando...'}
							</div>
							<div className="tw-text-xs tw-text-gray-500 tw-truncate">
								{!auth_context.loading ? auth?.person?.fullname || "" : '...'}
							</div>
						</div>
						<i className={cn(
							"fas fa-chevron-down tw-text-gray-400 tw-text-xs tw-transition-transform tw-duration-200",
							mobileMenuOpen && 'tw-rotate-180'
						)}></i>
					</button>

					{/* Mobile dropdown */}
					<div className={cn(
						"tw-overflow-hidden tw-transition-all tw-duration-200",
						mobileMenuOpen ? "tw-max-h-40 tw-mt-2" : "tw-max-h-0"
					)}>
						<div className="tw-p-1 tw-space-y-0.5">
							<Link
								href={{ pathname: '/notify', query: { tab: 'all_notify' } }}
								className="tw-flex tw-items-center tw-gap-2.5 tw-py-2 tw-px-3 tw-rounded-lg tw-text-gray-600 tw-no-underline tw-text-sm tw-transition-all tw-duration-150 hover:tw-bg-gray-50"
							>
								<i className="fas fa-bell tw-w-4 tw-text-gray-400 tw-text-xs"></i>
								Notificaciones
							</Link>
							<Link
								href="/"
								className="tw-flex tw-items-center tw-gap-2.5 tw-py-2 tw-px-3 tw-rounded-lg tw-text-gray-600 tw-no-underline tw-text-sm tw-transition-all tw-duration-150 hover:tw-bg-gray-50"
							>
								<i className="fas fa-user tw-w-4 tw-text-gray-400 tw-text-xs"></i>
								Mi Perfil
							</Link>
							<button
								className="tw-flex tw-items-center tw-gap-2.5 tw-py-2 tw-px-3 tw-rounded-lg tw-text-red-500 tw-text-sm tw-transition-all tw-duration-150 tw-w-full tw-border-0 tw-bg-transparent tw-cursor-pointer hover:tw-bg-red-50"
								onClick={() => auth_context.logout()}
							>
								<i className="fas fa-sign-out-alt tw-w-4 tw-text-red-400 tw-text-xs"></i>
								Cerrar Sesión
							</button>
						</div>
					</div>
				</header>

				{/* Menu */}
				<div className="aside-menu tw-flex-1 tw-overflow-y-auto tw-p-2">
					<nav id="stacked-menu" className="tw-p-0">
						<ul className="tw-list-none tw-p-0 tw-m-0 tw-space-y-0.5">
							<li>
								<Link
									href="/"
									className={cn(
										"tw-flex tw-items-center tw-gap-2.5 tw-py-2 tw-px-3 tw-rounded-lg tw-no-underline tw-text-sm tw-font-medium tw-transition-all tw-duration-150",
										pathname === '/'
											? 'tw-bg-gradient-to-r tw-from-primary-500 tw-to-primary-600 tw-text-white tw-shadow-md tw-shadow-primary-500/25'
											: 'tw-text-gray-600 hover:tw-bg-gray-50 hover:tw-text-primary-500'
									)}
								>
									<i className={cn(
										"fas fa-user tw-w-4 tw-text-center tw-text-xs",
										pathname === '/' ? 'tw-text-white/90' : 'tw-text-gray-400'
									)}></i>
									<span>Perfil</span>
								</Link>
							</li>
							<Navigation/>
						</ul>
					</nav>
				</div>

				{/* Footer */}
				<footer className="tw-p-2.5 tw-border-t tw-border-gray-100 tw-bg-gray-50/50">
					<a
						href={app?.support_link || "#"}
						target="_blank"
						rel="noopener noreferrer"
						className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-py-2 tw-px-3 tw-bg-gradient-to-r tw-from-primary-500 tw-to-primary-600 tw-text-white tw-rounded-lg tw-text-xs tw-font-medium tw-no-underline tw-transition-all tw-duration-200 hover:tw-shadow-md hover:tw-shadow-primary-500/30 hover:-tw-translate-y-px"
					>
						<i className="fas fa-headset"></i>
						<span>Soporte: {app?.support_name || "Técnico"}</span>
					</a>
				</footer>
			</div>
		</aside>
	);
}

export default Sidebar;
