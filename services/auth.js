import NextCookie from 'next-cookies';
import { setCookie, destroyCookie } from 'nookies';

export const AUTH =  (ctx) => {
    return NextCookie(ctx)['auth_token'] || false;
};

export const AUTHENTICATE = (ctx) => {
    // authorize
    if (AUTH(ctx)) return true;
    // not authorize
    if (ctx.isServer) {
        ctx.res.writeHead(301, { Location: '/login' })
        ctx.res.end();
        ctx.res.finished = true;
    } else {
        history.go('/login');
    }
};


export const GUEST = (ctx) => {
    // is guest
    if (!AUTH(ctx)) return true;
    // is AUTHENTICATE
    if (ctx.isServer) {
        ctx.res.writeHead(301, { Location: '/' });
        ctx.res.end();
        ctx.res.finished = true;
    } else {
        history.go('/');
    }
};


export const LOGIN = (ctx, token) => {
    setCookie(ctx, 'auth_token', token);
};


export const LOGOUT = (ctx) => {
    destroyCookie(ctx, 'auth_token');
}