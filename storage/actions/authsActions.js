import { authentication, configAuthorization } from '../../services/apis';
import cookies from 'js-cookie';
import { setCookie } from 'nookies';


export const authsActionsTypes = {
    AUTH: 'AUTH',
    LOGOUT: 'LOGOUT',
};


export const getAuth = (ctx) => {
    return async (dispatch) => {
        let Authorization = configAuthorization(ctx);
        await authentication.get('me', { headers: { Authorization } })
        .then(res => dispatch({ type: authsActionsTypes.AUTH, payload: res.data }))
        .catch(err => console.log(err.message));
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
                setCookie(ctx, 'device', message);
            }
        }).catch(err => console.log(err.message));
    }
}