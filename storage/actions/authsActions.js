import { authentication } from '../../services/apis';
import cookies from 'js-cookie';
import { setCookie } from 'nookies';
import { LOGOUT, AUTHENTICATE } from '../../services/auth';


export const authsActionsTypes = {
    AUTH: 'AUTH',
    LOGOUT: 'LOGOUT',
};


export const getAuth = (ctx) => {
    return async (dispatch) => {
        await authentication.get('me', {}, ctx)
        .then(res => {
            let { success, message, user } = res.data;
            if (success) {
                dispatch({ type: authsActionsTypes.AUTH, payload: user });
            } else throw new Error(message);
        })
        .catch(async err => {
            let { isServer } = ctx;
            await LOGOUT(ctx);
            if (isServer) {
                await AUTHENTICATE(ctx);
            } else {
                history.go('/login')
            }
            
        });
    }
}


export const logout = (ctx) => {
    return async (dispatch) => {
        await authentication.post('logout', {}, ctx)
        .then(async res => {
            let { success, message } = res.data;
            if (success) {
                await LOGOUT(ctx);
                if (ctx.isServer) {
                    ctx.res.writeHead(301, { Location: '/login' })
                    ctx.res.end();
                    ctx.res.finished = true;
                } else {
                   await history.go('/login');
                }
            }
        }).catch(err => console.log("logout", err.message));
    }
}