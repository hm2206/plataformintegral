import {  unujobs, configAuthorization } from '../../services/apis';


export const typeRemuneracionActionsTypes = {
    PAGE_TYPE_REMUNERACION: 'PAGE_TYPE_REMUNERACION'
};


export const pageTypeRemuneracion = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let Authorization = await configAuthorization(ctx);
        await unujobs.get(`type_remuneracion?page=${query.page}`, { headers: { Authorization } })
        .then(res =>  dispatch({ type: typeRemuneracionActionsTypes.PAGE_TYPE_REMUNERACION, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}