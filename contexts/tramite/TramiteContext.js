import React, { createContext, useContext, useMemo, useEffect, useReducer, useState } from 'react';
import AuthTrackingProvider from '../../providers/tramite/auth/AuthTrackingProvider';
import { TramiteSocket } from '../sockets/TramiteSocket';
import { initialState, tramiteReducer, tramiteTypes } from './TramiteReducer';
import AuthProvider from '../../providers/tramite/auth/AuthProvider';

// providers
const authTrackingProvider = new AuthTrackingProvider();
const authProvider = new AuthProvider();

export const TramiteContext = createContext();

export const TramiteProvider = ({ children, dependencia_id, role = {}, boss = {} }) => {

    // tramite_socket
    const { socket, online } = useContext(TramiteSocket);

    // estados
    const [query_search, setQuerySearch] = useState("");
    const [is_search, setIsSearch] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [last_page, setLastPage] = useState(0);
    const [total, setTotal] = useState(0)
    const [option, setOption] = useState([]);
    const [next, setNext] = useState(null);
    const [file, setFile] = useState({});
    const [tab, setTab] = useState();

    // is Role
    const isRole = Object.keys(role || {}).length;

    // reducer
    const [state, dispatch] = useReducer(tramiteReducer, initialState);

    // memos
    const { filtros, is_archived } = useMemo(() => {
        for (let status of state.status) {
            if (status.key == state.menu) {
                return { filtros: status.filtros, is_archived: status.archived };
            }
        }
        // default
        return [];
    }, [state.menu]);

    // options
    const options = {
        headers: { DependenciaId: dependencia_id }
    };

    // obtener tracking
    const getTracking = async (add = false) => {
        setCurrentLoading(true);
        // request
        await authTrackingProvider.index(tab, { page, status: filtros , query_search, archived: is_archived }, options)
            .then(res => {
                let { trackings } = res.data;
                setLastPage(trackings.lastPage);
                setTotal(trackings.total || 0);
                dispatch({ type: add ? tramiteTypes.PUSH : tramiteTypes.INITIAL, payload: trackings.data });
            })
            .catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // obtener status
    const getStatus = async () => {
        // options
        let options = {
            headers: { DependenciaId: dependencia_id }
        };
        // request 
        await authProvider.status(tab, { archive: is_archived, query_search }, options)
            .then(async res => {
                let { tracking_status } = res.data;
                dispatch({ type: tramiteTypes.INITIAL_MENU, payload: tracking_status });
            }).catch(err => console.error(err));
    }

    // selección de TAB
    const selectTab = () => {
        if (isRole && role.level == 'SECRETARY') {
            setTab("DEPENDENCIA");
        } else {
            setTab("YO");
        }
    }

    // conectarse a sala
    const connectSala = () => {
        let name = `${tab}#${dependencia_id}`;
        // validar sala solo dependencia
        if (tab == 'DEPENDENCIA') {
            socket?.emit('connect:inbox', name);
        }
        // save sala
        dispatch({ type:tramiteTypes.CHANGE_SALA, payload: name });
    }

    // cambio de menu
    useEffect(() => {
        if (state.menu) dispatch({ type: tramiteTypes.INITIAL, payload: [] });
    }, [state.menu]);

    // cambio de dependencia
    useEffect(() => {
        setTab(null);
        dispatch({ type: tramiteTypes.CHANGE_RENDER, payload: "TAB" });
        setTab(null);
        setPage(1);
    }, [dependencia_id]);

    // seleccionar tab
    useEffect(() => {
        if (!tab) selectTab();
    }, [tab]);

    // cargar al cambiar tab
    useEffect(() => {
        if (dependencia_id && tab && page) setIsSearch(true);
    }, [tab, page]);

    // executar búsqueda
    useEffect(() => {
        if (is_search) {
            getTracking();
            getStatus();
        }
    }, [is_search]);

    // disable search
    useEffect(() => {
        if (is_search) setIsSearch(false);
    }, [is_search]);

    // connect sala
    useEffect(() => {
        if (online && tab && dependencia_id) connectSala();
    }, [online, tab]);

    // render
    return (
        <TramiteContext.Provider value={{ 
            dependencia_id,
            isRole,
            role,
            boss,
            setIsSearch, 
            setQuerySearch, 
            query_search, 
            setPage,
            page, 
            last_page,
            total,
            current_loading,
            option, 
            setOption,
            tab, 
            setTab,
            filtros,
            next,
            setNext,
            file,
            setFile,
            ...state,
            dispatch,
            socket, 
            online
        }}>
            {children}
        </TramiteContext.Provider>
    )
}