import Cookies from 'js-cookie';
import Router from 'next/router';
import { authentication } from './apis';

// Obtener token del cliente
export const AUTH = () => {
    if (typeof window === 'undefined') return "";
    return Cookies.get('auth_token') || localStorage.getItem('auth_token') || "";
};

// Verificar autenticación - solo cliente
export const AUTHENTICATE = () => {
    if (typeof window === 'undefined') return false;
    const token = AUTH();
    if (token) return true;
    location.href = "/login";
    return false;
};

// Verificar que sea invitado - solo cliente
export const GUEST = () => {
    if (typeof window === 'undefined') return false;
    const token = AUTH();
    if (!token) return true;
    location.href = "/";
    return false;
};

// Login - guardar token
export const LOGIN = (token) => {
    Cookies.set('auth_token', token);
    localStorage.setItem('auth_token', token);
};

// Logout - eliminar token
export const LOGOUT = () => {
    Cookies.remove('auth_token');
    localStorage.removeItem('auth_token');
}

// Verificar permisos - solo cliente
export const VERIFY = async (systemSlug, name = "", type = "MODULE") => {
    if (typeof window === 'undefined') return false;
    const pathname = name || location.pathname;
    let { allow } = await authentication.get(`auth/permission/${systemSlug}/${type}?name=${pathname}`)
        .then(res => res.data)
        .catch(err => ({ success: false, status: err.status || 501, allow: false }));
    if (allow) return true;
    location.href = '/401';
    return false;
}
