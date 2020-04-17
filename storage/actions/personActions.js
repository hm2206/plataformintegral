import NextCookies from 'next-cookies';
import { authentication } from '../../services/apis';
import atob from 'atob';

export const personActionsTypes = {
    FIND_PERSON: "FIND_PERSON"
};


export const findPerson = (ctx) => {
    return async (dispatch) => {
        let Authorization = `Bearer ${NextCookies(ctx)['auth_token']}`;
        let id = ctx.query.id ? await atob(ctx.query.id) : "error";
        await authentication.get(`find_person/${id}`, { headers: { Authorization } })
        .then(res => dispatch({ type: personActionsTypes.FIND_PERSON, payload: res.data }));
    }
}