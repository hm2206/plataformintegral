import NextCookie from 'next-cookies';
import { setCookie, destroyCookie } from 'nookies';
import Router from 'next/router';
import { authentication } from './apis';

export const AUTH = (ctx) => {
    return NextCookie(ctx)['auth_token'] || "";
};

export const AUTHENTICATE = (ctx) => {
    // authorize
    if (AUTH(ctx)) return true;
    // not authorize
    if (ctx.res) {
        ctx.res.writeHead(302, { Location: '/login' })
        ctx.res.end();
        return { };
    } 
    // client
    Router.replace("/login");
    return { };
};


export const GUEST = (ctx) => {
    // is guest
    if (!AUTH(ctx)) return true;
    // is AUTHENTICATE
    if (ctx.res) {
        ctx.res.writeHead(302, { Location: '/' });
        ctx.res.end();
        return { };
    }
    // client
    Router.replace("/login");
    return { };
};


export const LOGIN = (ctx, token) => {
    setCookie(ctx, 'auth_token', token);
};


export const LOGOUT = (ctx) => {
    destroyCookie(ctx, 'auth_token');
}

export const VERIFY = async (ctx, systemSlug, name = "", type = "MODULE") => {
    name = name ? name : ctx.pathname;
    let { allow } = await authentication.get(`auth/permission/${systemSlug}/${type}?name=${name}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, status: err.status || 501, allow: false }));
    //  validar permiso
    if (allow) return true;
    // validar server
    if (ctx.res) {
        ctx.res.writeHead(301, { Location: '/401' });
        ctx.res.end();
    }
    // client
    Router.replace(`/401`); 
}