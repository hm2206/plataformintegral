import NextCookie from 'next-cookies';
import { setCookie } from 'nookies';

export const AUTH =  (ctx) => {
    return NextCookie(ctx)['auth_token'] || false;
};


export const AUTHENTICATE = (ctx) => {
    // authorize
    if (AUTH(ctx)) return true;
    // not authorize
    ctx.res.writeHead(301, { Location: '/login' })
    ctx.res.end();
    ctx.res.finished = true;
};


export const GUEST = (ctx) => {
    // is guest
    if (!AUTH(ctx)) return true;
    // is AUTHENTICATE
    ctx.res.writeHead(301, { Location: '/' });
    ctx.res.end();
    ctx.res.finished = true;
};


export const LOGIN = (ctx, token) => {
    setCookie(ctx, 'auth_token', token);
};