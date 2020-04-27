import {  unujobs, configAuthorization } from '../../services/apis';


export const typeDetalleActionsTypes = {
    TYPE_DETALLE: 'TYPE_DETALLE'
};


export const allTypeDetalle = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let Authorization = await configAuthorization(ctx);
        await unujobs.get(`type_detalle`, { headers: { Authorization } })
        .then(res =>  dispatch({ type: typeDetalleActionsTypes.TYPE_DETALLE, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}