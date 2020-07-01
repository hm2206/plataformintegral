import {  unujobs } from '../../services/apis';


export const metaActionsTypes = {
    PAGE_META: 'PAGE_META',
    CLEAR_META: 'CLEAR_META'
};


export const pageMeta = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`meta?estado=${query.estado}&year=${query.year}`, {}, ctx)
        .then(res =>  dispatch({ type: metaActionsTypes.PAGE_META, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}