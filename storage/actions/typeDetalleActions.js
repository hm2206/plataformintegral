import {  unujobs } from '../../services/apis';


export const typeDetalleActionsTypes = {
    TYPE_DETALLE: 'TYPE_DETALLE',
    CLEAR_DETALLE: 'CLEAR_TYPE_DETALLE'
};


export const allTypeDetalle = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`type_detalle`, {}, ctx)
        .then(res =>  {
            let { success, type_detalles, message } = res.data;
            if (!success) throw new Error(message);
            return dispatch({ type: typeDetalleActionsTypes.TYPE_DETALLE, payload: type_detalles })
        })
        .catch(err => console.log(err.message));
    }
}