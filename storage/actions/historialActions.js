import { unujobs } from '../../services/apis';
import atob from 'atob';

export const historialActionsTypes = {
    ALL_HISTORIAL: "ALL_HISTORIAL",
    FIND_HISTORIAL: "FIND_HISTORIAL",
    CLEAR_HISTORIAL: "CLEAR_HISTORIAL",
};


export const allHistorial = (ctx) => {
    return async (dispatch) => {
        let { page, query_search } = ctx.query;
        await unujobs.get(`historial?page=${page}&query_search=${query_search}`, {}, ctx)
        .then(res => dispatch({ type: historialActionsTypes.ALL_HISTORIAL, payload: res.data }))
        .catch(err => console.log(err.message));
    } 
}

