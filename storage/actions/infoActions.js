import { unujobs } from '../../services/apis';
import atob from 'atob';

export const infoActionsTypes = {
    ALL_INFO: "ALL_INFO",
    FIND_INFO: "FIND_INFO",
    CLEAR_INFO: "CLEAR_INFO"
};


export const allInfo = (ctx) => {
    return async (dispatch) => {
        let { page, query_search, estado } = ctx.query;
        await unujobs.get(`info?page=${page}&query_search=${query_search}&estado=${estado}`, {}, ctx)
        .then(res => dispatch({ type: infoActionsTypes.ALL_INFO, payload: res.data }))
        .catch(err => console.log(err.message));
    } 
}

export const findInfo = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let id = query.id ? atob(query.id) : 'error';
        await unujobs.get(`info/${id}`, {}, ctx)
        .then(res => dispatch({ type: infoActionsTypes.FIND_INFO, payload: res.data }))
    }
}

