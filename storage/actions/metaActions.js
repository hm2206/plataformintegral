import {  unujobs, configAuthorization } from '../../services/apis';


export const metaActionsTypes = {
    PAGE_META: 'PAGE_META',
};


export const pageMeta = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let Authorization = await configAuthorization(ctx);
        await unujobs.get(`meta?estado=${query.estado}&year=${query.year}`, { headers: { Authorization } })
        .then(res =>  dispatch({ type: metaActionsTypes.PAGE_META, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}