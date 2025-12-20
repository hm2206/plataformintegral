import React, { useContext, useState, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';
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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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

	// dropdown state
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	// close dropdown on outside click
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

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

	// get initials
	const getInitials = (name) => {
		if (!name) return 'U';
		return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
	}

	return (
		<header className="tw-sticky tw-top-0 tw-z-[1000] tw-h-14 tw-bg-gradient-to-r tw-from-primary-500 tw-to-primary-600 tw-shadow-md">
			<div className="tw-flex tw-items-center tw-h-full tw-py-2">
				{/* Logo - mismo ancho que sidebar (w-56 = 224px) */}
				<div className={cn(
					"tw-items-center tw-justify-center tw-w-56 tw-h-full tw-border-r tw-border-white/15 tw-flex-shrink-0",
					fullscreen || !extendView.includes(mode) ? 'tw-hidden' : 'tw-flex'
				)}>
					<Link href="/" className="tw-flex tw-items-center">
						<Logo/>
					</Link>
				</div>

				{/* Menu toggle */}
				<Show condicion={extendView.includes(mode)}>
					<Button
						variant="ghost"
						size="icon"
						className="tw-bg-white/10 tw-text-white tw-w-8 tw-h-8 tw-ml-3 tw-mr-2 hover:tw-bg-white/20"
						onClick={() => setFullscreen(!fullscreen)}
					>
						<i className={`fas fa-${fullscreen ? 'expand' : 'compress'} tw-text-sm`}></i>
					</Button>
				</Show>

				{/* Entity selector */}
				<Show condicion={!auth_context.loading && render}>
					<div className="tw-flex-none tw-ml-3 navbar-entity-selector">
						<style>{`
							.navbar-entity-selector .ui.selection.dropdown {
								min-width: 200px;
								max-width: 260px;
								min-height: 34px !important;
								padding: 8px 32px 8px 12px !important;
								border: none !important;
								border-radius: 8px !important;
								background: rgba(255,255,255,0.15) !important;
								font-size: 13px !important;
								backdrop-filter: blur(4px);
							}
							.navbar-entity-selector .ui.selection.dropdown:hover {
								background: rgba(255,255,255,0.25) !important;
							}
							.navbar-entity-selector .ui.selection.dropdown > .text {
								color: white !important;
								white-space: nowrap !important;
								overflow: hidden !important;
								text-overflow: ellipsis !important;
								display: block !important;
								max-width: 100% !important;
							}
							.navbar-entity-selector .ui.selection.dropdown > .default.text {
								color: rgba(255,255,255,0.7) !important;
							}
							.navbar-entity-selector .ui.selection.dropdown > .dropdown.icon {
								color: rgba(255,255,255,0.7) !important;
								top: 50% !important;
								transform: translateY(-50%) !important;
								margin-top: 0 !important;
								right: 10px !important;
							}
							.navbar-entity-selector .ui.selection.dropdown .menu {
								border-radius: 8px !important;
								margin-top: 4px !important;
								border: 1px solid #e5e7eb !important;
								box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
								background: white !important;
								max-width: 320px !important;
							}
							.navbar-entity-selector .ui.selection.dropdown .menu > .item {
								font-size: 13px !important;
								padding: 10px 12px !important;
								color: #374151 !important;
								background: white !important;
							}
							.navbar-entity-selector .ui.selection.dropdown .menu > .item:hover {
								background: #f3f4f6 !important;
								color: #346cb0 !important;
							}
							.navbar-entity-selector .ui.selection.dropdown .menu > .item.selected {
								background: #eff6ff !important;
								color: #346cb0 !important;
								font-weight: 500 !important;
							}
							.navbar-entity-selector .ui.selection.dropdown .menu > .item .text {
								color: #374151 !important;
							}
							.navbar-entity-selector .ui.selection.dropdown .menu > .item:hover .text,
							.navbar-entity-selector .ui.selection.dropdown .menu > .item.selected .text {
								color: #346cb0 !important;
							}
						`}</style>
						<SelectEntityUser
							user_id={auth_context.auth?.id}
							value={entity_id}
							name="entity_id"
							disabled={disabled}
							onChange={(e, obj) => handleEntity(obj)}
							onReady={entityDefault}
						/>
					</div>
				</Show>

				{/* Mobile hamburger */}
				<div className="d-md-none d-lg-none d-xl-none tw-ml-auto tw-pr-3">
					<Button
						variant="ghost"
						size="icon"
						className="tw-bg-white/10 tw-text-white tw-w-8 tw-h-8 hover:tw-bg-white/20"
						onClick={() => setToggle(!toggle)}
					>
						<div className="tw-flex tw-flex-col tw-gap-1">
							<span className={cn(
								"tw-w-4 tw-h-0.5 tw-bg-white tw-rounded-sm tw-transition-all tw-duration-200",
								toggle && 'tw-rotate-45 tw-translate-y-1.5'
							)}></span>
							<span className={cn(
								"tw-w-4 tw-h-0.5 tw-bg-white tw-rounded-sm tw-transition-all tw-duration-200",
								toggle ? 'tw-opacity-0' : 'tw-opacity-100'
							)}></span>
							<span className={cn(
								"tw-w-4 tw-h-0.5 tw-bg-white tw-rounded-sm tw-transition-all tw-duration-200",
								toggle && '-tw-rotate-45 -tw-translate-y-1.5'
							)}></span>
						</div>
					</Button>
				</div>

				{/* Right side */}
				<div className="tw-ml-auto tw-flex tw-items-center tw-gap-1.5 tw-pr-3 d-none d-sm-flex">
					{/* Refresh */}
					<Show condicion={extendView.includes(mode)}>
						<Button
							variant="ghost"
							size="icon"
							className="tw-bg-white/10 tw-text-white tw-w-8 tw-h-8 hover:tw-bg-white/20"
							onClick={handleRefreshPage}
							title="Actualizar página"
						>
							<i className="fas fa-sync-alt tw-text-xs"></i>
						</Button>
					</Show>

					{/* Notifications */}
					<Notification/>

					{/* User dropdown */}
					<div className="tw-relative" ref={dropdownRef}>
						<button
							className="tw-bg-white/10 tw-border-0 tw-rounded-lg tw-py-1 tw-px-2 tw-flex tw-items-center tw-gap-2 tw-cursor-pointer tw-transition-all tw-duration-200 hover:tw-bg-white/20"
							onClick={() => setDropdownOpen(!dropdownOpen)}
						>
							<div className="tw-relative">
								<Avatar className="tw-w-7 tw-h-7 tw-border-2 tw-border-white/30">
									<AvatarImage
										src={auth_context.auth?.image_images?.image_50x50 || auth_context.auth?.image || '/img/perfil.jpg'}
										alt="perfil"
									/>
									<AvatarFallback className="tw-bg-primary-700 tw-text-white tw-text-xs">
										{getInitials(auth_context.auth?.username)}
									</AvatarFallback>
								</Avatar>
								<span className={cn(
									"tw-absolute -tw-bottom-0.5 -tw-right-0.5 tw-w-2 tw-h-2 tw-rounded-full tw-border-2 tw-border-primary-500",
									online ? 'tw-bg-green-400' : 'tw-bg-gray-400'
								)}></span>
							</div>
							<div className="d-none d-lg-block tw-text-left">
								<div className="tw-text-white tw-text-xs tw-font-medium tw-max-w-[100px] tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap">
									{auth_context.auth?.username || "Usuario"}
								</div>
							</div>
							<i className={cn(
								"fas fa-chevron-down d-none d-lg-block tw-text-white/70 tw-text-[9px] tw-transition-transform tw-duration-200",
								dropdownOpen && 'tw-rotate-180'
							)}></i>
						</button>

						{/* Dropdown menu */}
						<div className={cn(
							"tw-absolute tw-right-0 tw-top-full tw-mt-1 tw-bg-white tw-rounded-xl tw-shadow-xl tw-border tw-border-gray-100 tw-p-1.5 tw-min-w-[180px] tw-transition-all tw-duration-200 tw-origin-top-right",
							dropdownOpen
								? "tw-opacity-100 tw-scale-100 tw-visible"
								: "tw-opacity-0 tw-scale-95 tw-invisible"
						)}>
							{/* User info header */}
							<div className="tw-px-3 tw-py-2 tw-border-b tw-border-gray-100 tw-mb-1">
								<div className="tw-text-sm tw-font-semibold tw-text-gray-900 tw-truncate">
									{auth_context.auth?.person?.fullname || auth_context.auth?.username || "Usuario"}
								</div>
								<div className="tw-text-xs tw-text-gray-500 tw-truncate">
									{auth_context.auth?.email || ""}
								</div>
							</div>

							<Link
								href="/"
								className="tw-flex tw-items-center tw-gap-2.5 tw-py-2 tw-px-3 tw-rounded-lg tw-text-gray-600 tw-no-underline tw-text-sm tw-transition-all tw-duration-150 hover:tw-bg-gray-50 hover:tw-text-primary-500"
								onClick={() => setDropdownOpen(false)}
							>
								<i className="fas fa-user tw-w-4 tw-text-center tw-text-gray-400 tw-text-xs"></i>
								Mi Perfil
							</Link>
							<Link
								href="/docs"
								className="tw-flex tw-items-center tw-gap-2.5 tw-py-2 tw-px-3 tw-rounded-lg tw-text-gray-600 tw-no-underline tw-text-sm tw-transition-all tw-duration-150 hover:tw-bg-gray-50 hover:tw-text-primary-500"
								onClick={() => setDropdownOpen(false)}
							>
								<i className="fas fa-question-circle tw-w-4 tw-text-center tw-text-gray-400 tw-text-xs"></i>
								Ayuda
							</Link>
							<div className="tw-h-px tw-bg-gray-100 tw-my-1"></div>
							<button
								className="tw-flex tw-items-center tw-gap-2.5 tw-py-2 tw-px-3 tw-rounded-lg tw-text-red-500 tw-text-sm tw-transition-all tw-duration-150 tw-w-full tw-border-0 tw-bg-transparent tw-cursor-pointer hover:tw-bg-red-50"
								onClick={(e) => {
									e.preventDefault();
									setDropdownOpen(false);
									auth_context.logout();
								}}
							>
								<i className="fas fa-sign-out-alt tw-w-4 tw-text-center tw-text-red-400 tw-text-xs"></i>
								Cerrar Sesión
							</button>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}

export default Navbar;
