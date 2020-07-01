import { unujobs } from '../../services/apis';
import atob from 'atob';


export const cronogramaActionsTypes = {
    FIND_CRONOGRAMA: 'FIND_CRONOGRAMA',
    ALL_CRONOGRAMA: 'ALL_CRONOGRAMA',
    REMOVE: 'REMOVE',
    CLEAR_CRONOGRAMA: 'CLEAR_CRONOGRAMA'
};

export const findCronograma = (ctx) => {
    return async (dispatch) => {
        let { page, like, cargo_id, type_categoria_id } = ctx.query;
        let id = ctx.query.id ? await atob(ctx.query.id) : "error";
        let params = `page=${page ? page : 1}&like=${like ? like : ''}&cargo_id=${cargo_id ? cargo_id : ''}&type_categoria_id=${type_categoria_id ? type_categoria_id : ''}`;
        let path = `cronograma/${id}?${params}`;
        await unujobs.get(path, {}, ctx)
        .then(res => dispatch({ type: cronogramaActionsTypes.FIND_CRONOGRAMA, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}

export const allCronograma = (ctx) => {
    return async (dispatch) => {
        let { year, mes } = ctx.query;
        let params = `year=${year}&mes=${mes}`;
        let path = `cronograma?${params}`;
        await unujobs.get(path, {}, ctx)
        .then(res =>  dispatch({ type: cronogramaActionsTypes.ALL_CRONOGRAMA, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}


export const removeHistorialCronograma = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let id = query.id ? await atob(ctx.query.id) : "error";
        let params = `page=${query.page}&cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}&query_search=${query.query_search}`;
        await unujobs.get(`cronograma/${id}/remove?${params}`, {}, ctx)
        .then(res =>  dispatch({ type: cronogramaActionsTypes.REMOVE, payload: res.data }));
    }
}