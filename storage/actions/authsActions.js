import NextCookies from 'next-cookies';
import { authentication } from '../../services/apis';


export const authsActionsTypes = {
    AUTH: 'AUTH',
    LOGOUT: 'LOGOUT',
};


export const getAuth = (ctx) => {
    return async (dispatch) => {
        let Authorization = `Bearer ${NextCookies(ctx)['auth_token']}`;
        await authentication.get('me', { headers: { Authorization } })
        .then(res => dispatch({ type: authsActionsTypes.AUTH, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}