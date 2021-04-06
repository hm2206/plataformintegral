import React, { useEffect, useContext } from 'react';
import AuthProvider from '../../providers/tramite/auth/AuthProvider';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';

// providers
const authProvider = new AuthProvider();

const InboxMenu = ({ col = "col-xl-2 col-md-3", dependencia_id = null }) => {
    
    // tramite
    const { status, menu, dispatch, setPage, setIsSearch, current_loading, tab } = useContext(TramiteContext);

    // obtener status
    const getStatus = async () => {
        // options
        let options = {
            headers: { DependenciaId: dependencia_id }
        };
        // request 
        await authProvider.status(tab, {}, options)
            .then(async res => {
                let { tracking_status } = res.data;
                dispatch({ type: tramiteTypes.INITIAL_MENU, payload: tracking_status });
            }).catch(err => console.error(err));
    }

    // seleccionar tab
    const handleSelect = (state) => {
        if (current_loading) return false;
        dispatch({ type: tramiteTypes.CHANGE_MENU, payload: state.key });
        setPage(1);
        setIsSearch(true);
    }

    // inicializando menu
    useEffect(() => {
        if (dependencia_id) dispatch({ type: tramiteTypes.CHANGE_MENU, payload: "INBOX" });
    }, []);

    // cambio de dependencia
    useEffect(() => {
        if (dependencia_id && tab) getStatus();
    }, [tab]);
    
    // render
    return (
        <div className={`${col} `}>
            <ul className="mb-2 nav nav-tab flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                <li className="nav-item mail-section">
                    {status.map((state, indexS) => 
                        <a className={`nav-link text-left cursor-pointer ${state.key === menu ? 'active' : ''}`}
                            key={`item-menu-mail-${indexS}-${state.key}`}
                            onClick={(e) => handleSelect(state)}
                        >
                            <span><i className={state.icon}></i> {state.text}</span>
                            <span className="badge badge-warning float-right">{state.count ? state.count : ''}</span>
                        </a>
                    )}
                </li>
            </ul>
        </div>
    );
}

export default InboxMenu;