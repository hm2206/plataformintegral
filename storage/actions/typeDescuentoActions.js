import {  unujobs } from '../../services/apis';


export const typeDescuentoActionsTypes = {
    PAGE_TYPE_DESCUENTO: 'PAGE_TYPE_DESCUENTO',
    CLEAR_TYPE_DESCUENTO: 'CLEAR_TYPE_DESCUENTO'
};


export const pageTypeDescuento = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`type_descuento?page=${query.page || 1}&estado=${query.estado || 1}`, {}, ctx)
        .then(res =>  dispatch({ type: typeDescuentoActionsTypes.PAGE_TYPE_DESCUENTO, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}