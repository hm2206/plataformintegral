import React, { useEffect, useContext } from 'react';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';

const InboxMenu = ({ col = "col-xl-2 col-md-3", dependencia_id = null }) => {
    
    // tramite
    const { status, menu, dispatch, setPage, setIsSearch } = useContext(TramiteContext);

    // seleccionar menu
    const handleMenu = (newMenu) => {
        setPage(1);
        setIsSearch(true);
        dispatch({ type: tramiteTypes.CHANGE_MENU, payload: newMenu });
        dispatch({ type: tramiteTypes.CHANGE_RENDER, payload: "TAB" });
    }

    // inicializando menu
    useEffect(() => {
        dispatch({ type: tramiteTypes.CHANGE_MENU, payload: "INBOX" });
    }, []);
    
    // render
    return (
        <div className={`${col} `}>
            <ul className="mb-2 nav nav-tab flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                <li className="nav-item mail-section">
                    {status.map((state, indexS) => 
                        <a className={`nav-link text-left cursor-pointer ${state.key === menu ? 'active' : ''}`}
                            key={`item-menu-mail-${indexS}-${state.key}`}
                            onClick={() => handleMenu(state.key)}
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