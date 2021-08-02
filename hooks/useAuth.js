import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import { authentication } from '../services/apis';
import Router from 'next/router';

const useAuth = () => {

    // estados
    const [loading, setLoading] = useState(false);
    const [is_logged, setIsLogged] = useState(undefined);

    // remover tokens
    const removeToken = () => {
        localStorage.removeItem('auth_token');
        Cookies.remove('auth_token');
    }

    // agregar token
    const addToken = (token = "") => {
        localStorage.setItem('auth_token', token);
        Cookies.set('auth_token', token);
    }

    // obtener usuario
    const getUser = async () => {
        setLoading(true);
        let { user, success } = await authentication.get('me')
            .then(res => res.data)
            .catch(() => ({ success: false, user: {} }));
        setLoading(false);
        setIsLogged(success);
        return user;
    }

    // logout
    const getLogout = async (redirect = "/login") => {
        let { success, message } = await authentication.post('logout')
            .then(async res => res.data)
            .catch(err => ({ success: false, message: "No se pudó cerrar sesión" }));
        if (success) {
            removeToken();
            Router.push(redirect);
        }
        return { success, message };
    }
    
    // executar authentication
    const getAuth = useCallback(() => getUser(), []);

    // executar logout
    const logout = useCallback(() => getLogout(), []);

    // exportar
    return { getAuth, is_logged, logout, loading, removeToken, addToken };
}

export default useAuth;