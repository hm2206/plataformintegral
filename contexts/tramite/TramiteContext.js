import React, { createContext, useEffect, useReducer, useState } from 'react';
import AuthTrackingProvider from '../../providers/tramite/auth/AuthTrackingProvider';
import { intialState, tramiteReducer, tramiteTypes } from './TramiteReducer';

// providers
const authTrackingProvider = new AuthTrackingProvider();

export const TramiteContext = createContext();

export const TramiteProvider = ({ children, dependencia_id, role = {}, boss = {} }) => {

    // estados
    const [query_search, setQuerySearch] = useState("");
    const [is_search, setIsSearch] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [last_page, setLastPage] = useState(0);
    const [total, setTotal] = useState(0);

    // is Role
    const isRole = Object.keys(role || {}).length;

    // reducer
    const [stateTramite, dispatch] = useReducer(tramiteReducer, intialState);

    // obtener tracking
    const getTracking = async (add = false) => {
        setCurrentLoading(true);
        // options
        let options = {
            headers: { DependenciaId: dependencia_id }
        };
        // request
        await authTrackingProvider.index(stateTramite.tab, { page, status: stateTramite.filtros , query_search }, options)
            .then(res => {
                let { trackings } = res.data;
                setLastPage(trackings.lastPage);
                setTotal(trackings.tota || 0);
                dispatch({ type: add ? tramiteTypes.PUSH : tramiteTypes.INITIAL, payload: trackings.data });
            })
            .catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // selección de TAB
    const selectTab = () => {
        if (isRole && role.level == 'SECRETARY') {
            dispatch({ type: tramiteTypes.CHANGE_TAB, payload: "DEPENDENCIA" })
        } else {
            dispatch({ type: tramiteTypes.CHANGE_TAB, payload: "YO" })
        }
    }

    // cambio de dependencia
    useEffect(() => {
       dispatch({ type: tramiteTypes.CHANGE_TAB, payload: null });
       setPage(1);
    }, [dependencia_id]);

    // seleccionar tab
    useEffect(() => {
        if (!stateTramite.tab) selectTab();
    }, [stateTramite.tab]);

    // executar búsqueda
    useEffect(() => {
        if (is_search) getTracking();
    }, [is_search]);

    // cargar al camb
    useEffect(() => {
        if (stateTramite.tab) setIsSearch(true);
    }, [stateTramite.tab]);

    // disable search
    useEffect(() => {
        if (is_search) setIsSearch(false);
    }, [is_search]);

    // render
    return (
        <TramiteContext.Provider value={{ 
            isRole,
            role,
            boss,
            setIsSearch, 
            setQuerySearch, 
            query_search, 
            setPage, 
            last_page,
            total,
            current_loading, 
            ...stateTramite,
            dispatch,
        }}>
            {children}
        </TramiteContext.Provider>
    )
}