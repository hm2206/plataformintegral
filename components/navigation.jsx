import React, { useEffect, useState } from "react";
import SkullNavigation from "./loaders/skullNavigation";
import Router from "next/router";
import Show from "./show";
import { authentication } from '../services/apis';
import useCurrentRoute from '../hooks/useCurrentRoute';
import btoa from 'btoa';

const NavLink = ({ children, active = false, url = "/", onClick = null }) => {
	return (
		<a
			href={url}
			className={`menu-link ${active ? "text-primary" : ""}`}
			// onClick={(e) => {
			// 	e.preventDefault();
			// 	typeof onClick == 'function' ? onClick(url) : null;
			// }}
		>
			<Show condicion={active}
				predeterminado={children}
			>
				<b className="text-primary">{children}</b>
			</Show>
		</a>
	);
};


const  Navigation = () => {

	// estados
	const [current_loading, setCurrentLoading] = useState(false);
	const [options, setOptions] = useState([]);
	const [is_error, setIsError] = useState(false);
	const [current_active, setCurrentActive] = useState(undefined);
	const [current_toggle, setCurrentToggle] = useState(undefined);

	// hooks
	const { vefiryRoute } = useCurrentRoute();

	// default route
	const routeDefault = (data = []) => {
		data.map((d, indexD) => {
			let [is_current, path] = vefiryRoute(d.alias);
			if (is_current) {
				setCurrentToggle(indexD);
			}
		});
	}

	// obtener listado de menu
  	const getMenu =  async () => {
		setCurrentLoading(true);
		await authentication.get(`auth/menu`)
		.then(res => {
			// add options
			setOptions(res.data);
			// checkar ruta
			routeDefault(res.data);
			// sin error
			setIsError(false);
      	}).catch(err => {
			setIsError(true)
		  });
		setCurrentLoading(false);
    }

	// executar obtener menu
	useEffect(() => {
		getMenu();
	}, []);

	// manejador de link
	const handleLink = async (url, child) => {
		let clickb = "menu-link";
		let newQuery = { clickb };
		let { push } = Router;
		push({ pathname: url, query: newQuery });
		// active module
		setCurrentActive(child);
	};

	// renderizar
    return (
		<Show condicion={!current_loading}
			predeterminado={<SkullNavigation/>}
		>
			{/* lista de menus */}
			<Show condicion={!is_error}>
				{options.map((opt, indexO) => 
					<li key={`list-menu.item-${indexO}`}
						className={`menu-item ${current_toggle == indexO ? 'hans-open has-active' : 'has-child'}`}
					>
						<span className="cursor-pointer menu-link" 
							onClick={(e) => setCurrentToggle(indexO == current_toggle ? undefined : indexO)} 
							title={opt.description || ""}
						>
							<span className={`menu-icon ${opt.icon}`}></span>
        					<span className="menu-text">{opt.name || ""}</span>{" "}
        					<span className="badge badge-xs badge-warning">{opt.version || ""}</span>
						</span>
						{/* modules */}
						<Show condicion={opt.modules && opt.modules.length}>
							<ul className="menu">
								<li className="menu-subhead">{opt.name || ""}</li>
								{opt.modules && opt.modules.map((mod, indexM) => 
									<li key={`childre-${mod.id}`}
										className="menu-item"
									>
										<NavLink
											url={`${mod.slug}`}
											active={current_active == indexM ? true : false}
											onClick={(url) => handleLink(url, indexM)}
										>
											{mod.name}
										</NavLink>
									</li>		
								)}
							</ul>
						</Show>
					</li>
				)}
			</Show>
		</Show>
	);
}


export default Navigation;
