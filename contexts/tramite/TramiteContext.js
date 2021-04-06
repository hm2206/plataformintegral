import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import AuthTrackingProvider from '../../providers/tramite/auth/AuthTrackingProvider';
import { TramiteSocket } from '../sockets/TramiteSocket';
import { initialState, tramiteReducer, tramiteTypes } from './TramiteReducer';

// providers
const authTrackingProvider = new AuthTrackingProvider();

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

    // is Role
    const isRole = Object.keys(role || {}).length;

    // reducer
    const [state, dispatch] = useReducer(tramiteReducer, initialState);

    // obtener tracking
    const getTracking = async (add = false) => {
        setCurrentLoading(true);
        // options
        let options = {
            headers: { DependenciaId: dependencia_id }
        };
        // request
        await authTrackingProvider.index(state.tab, { page, status: state.filtros , query_search }, options)
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

    // conectarse a sala
    const connectSala = () => {
        let name = `${state.tab}#${dependencia_id}`;
        socket?.emit('connect:inbox', name);
        // save sala
        dispatch({ type:tramiteTypes.CHANGE_SALA, payload: name });
    }

    // escuchar message
    const onInbox = () => {
        socket?.on('inbox:message', (data) => {
            console.log(data);
        });
    }

    // cambio de dependencia
    useEffect(() => {
        dispatch({ type: tramiteTypes.CHANGE_TAB, payload: null });
        dispatch({ type: tramiteTypes.CHANGE_RENDER, payload: "TAB" });
        setPage(1);
    }, [dependencia_id]);

    // seleccionar tab
    useEffect(() => {
        if (!state.tab) selectTab();
    }, [state.tab]);

    // cargar al camb
    useEffect(() => {
        if (dependencia_id && state.tab) setIsSearch(true);
    }, [state.tab]);

    // executar búsqueda
    useEffect(() => {
        if (is_search) getTracking();
    }, [is_search]);

    // disable search
    useEffect(() => {
        if (is_search) setIsSearch(false);
    }, [is_search]);

    // connect sala
    useEffect(() => {
        if (online && state.tab && dependencia_id) connectSala();
    }, [online, state.tab]);

    // escuchar message
    useEffect(() => {
        if (socket) onInbox();
    }, [socket]);

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
            last_page,
            total,
            current_loading,
            option, 
            setOption, 
            next,
            setNext,
            file,
            setFile,
            ...state,
            dispatch,
        }}>
            {children}
        </TramiteContext.Provider>
    )
}