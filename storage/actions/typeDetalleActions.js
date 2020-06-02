import {  unujobs } from '../../services/apis';


export const typeDetalleActionsTypes = {
    TYPE_DETALLE: 'TYPE_DETALLE'
};


export const allTypeDetalle = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`type_detalle`, {}, ctx)
        .then(res =>  dispatch({ type: typeDetalleActionsTypes.TYPE_DETALLE, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}