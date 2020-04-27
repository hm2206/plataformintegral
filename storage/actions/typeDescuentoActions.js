import {  unujobs, configAuthorization } from '../../services/apis';


export const typeDescuentoActionsTypes = {
    PAGE_TYPE_DESCUENTO: 'PAGE_TYPE_DESCUENTO'
};


export const pageTypeDescuento = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let Authorization = await configAuthorization(ctx);
        await unujobs.get(`type_descuento?page=${query.page}`, { headers: { Authorization } })
        .then(res =>  dispatch({ type: typeDescuentoActionsTypes.PAGE_TYPE_DESCUENTO, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}