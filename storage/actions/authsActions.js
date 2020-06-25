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
        let Authorization = configAuthorization(ctx);
        await authentication.post('logout', { headers: { Authorization } })
        .then(async res => {
            let { success, message } = res.data;
            if (success) {
                cookies.remove('auth_token');
                await setCookie(ctx, 'device', message);
                if (ctx.isServer) {
                    ctx.res.writeHead(301, { Location: '/login' })
                    ctx.res.end();
                    ctx.res.finished = true;
                }
            }
        }).catch(err => console.log(err.message));
    }
}