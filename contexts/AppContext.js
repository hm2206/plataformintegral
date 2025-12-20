import { createContext, useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import uid from '../utils/uid';
import Show from '../components/show';
import { ScreenContext } from './ScreenContext';

// Dynamic imports para evitar dependencia circular
const NotCurrent = dynamic(() => import('../components/notCurrent'), { ssr: false });
const AppHeader = dynamic(() => import('../components/appHeader'), { ssr: false });
const NotInternet = dynamic(() => import('../components/notInternet'), { ssr: false });
const Maintenance = dynamic(() => import('../components/maintenance'), { ssr: false });
const LoadingGlobal = dynamic(() => import('../components/loadingGlobal'), { ssr: false });

// definiendo context
export const AppContext = createContext();


// exportando provedores
export const AppProvider = ({ children, success, app, pathname, query }) => {

    // screen context
    const { toggle, setToggle } = useContext(ScreenContext);

    // flags
    let intervaloCurrent = null;
    let intervaloInternet = null;

    // estados
    const [current_window, setCurrentWindow] = useState(undefined);
    const [is_internet, setIsInternet] = useState(true);
    const [current_app, setCurrentApp] = useState(true);
    const [current_loading, setCurrentLoading] = useState(false);

    // verificar window token
    const verifyApp = () => {
        let window_token = localStorage.getItem('currentWindow');
        if (window_token != current_window) {
            setCurrentApp(true);
            clearInterval(intervaloCurrent);
        }
    }

    // verificar internet
    const verifyInternet = () => {
        let is_online = navigator.onLine;
        if (is_internet != is_online) {
            setIsInternet(/*is_online*/ true);
            clearInterval(intervaloInternet);
        }
    }

    // genenar window token
    const generateWindowToken = () => {
        let window_token = uid(16);
        localStorage.setItem('currentWindow', window_token);
        setCurrentWindow(window_token);
    }

    // executar window token
    useEffect(() => {
        generateWindowToken();
    }, []);

    // activar window token
    useEffect(() => {
        if (current_window) intervaloCurrent = setInterval(verifyApp, 2000);
        return () => clearInterval(intervaloCurrent);
    }, [current_window]);

    // activar verificacion de internet
    useEffect(() => {
        intervaloInternet = setInterval(verifyInternet, 2000);
        return () => clearInterval(intervaloInternet);
    }, [is_internet]);

    // render
    return (
        <AppContext.Provider value={{ 
                success, 
                app, 
                pathname, 
                query,
                is_internet, 
                current_window,
                current_loading,
                setCurrentLoading,
            }}
        >
            {/* headers */}
            <AppHeader/>
            {/* precargar imagen */}
            <img src={"/img/loading_page.png" } style={{ display: 'none' }}/> 
            {/* aplicación en despliegue */}
            <Show condicion={success}
                predeterminado={<Maintenance/>}
            >
                {/* loading de cambio de ruta */}
                <LoadingGlobal display="none" id="loading-brand"/>
                {/* components */}
                <Show condicion={current_app}
                    predeterminado={<NotCurrent/>}
                >
                    {children}
                </Show>
                {/* no hay internet */}
                <Show condicion={!is_internet}>
                    <NotInternet/>
                </Show>
                {/* toggle bar */}
                <div className={`aside-backdrop ${toggle ? 'show' : ''}`}
                    onClick={(e) => setToggle(false)}
                />
            </Show>
        </AppContext.Provider>
    )
};


// exportando consumers
export const AppConsumer = AppContext.Consumer;
