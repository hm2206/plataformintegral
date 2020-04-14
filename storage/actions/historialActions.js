import NextCookies from 'next-cookies';
import { unujobs } from '../../services/apis';
import atob from 'atob';

export const historialActionsTypes = {
    ALL_HISTORIAL: "ALL_HISTORIAL",
    FIND_HISTORIAL: "FIND_HISTORIAL"
};


export const allHistorial = (ctx) => {
    return async (dispatch) => {
        let Authorization = `Bearer ${NextCookies(ctx)['auth_token']}`;
        let { page, query_search } = ctx.query;
        await unujobs.get(`historial?page=${page}&query_search=${query_search}`, { headers: { Authorization } })
        .then(res => dispatch({ type: historialActionsTypes.ALL_HISTORIAL, payload: res.data }))
        .catch(err => console.log(err.message));
    } 
}

