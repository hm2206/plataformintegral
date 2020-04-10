import NextCookies from 'next-cookies';
import { authentication, configAuthorization } from '../../services/apis';


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