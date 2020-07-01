import {  unujobs } from '../../services/apis';


export const typeAportacionActionsTypes = {
    TYPE_APORTACION: 'TYPE_APORTACION',
    CLEAR_TYPE_APORTACION: 'CLEAR_TYPE_APORTACION'
};


export const allTypeAportacion = (ctx) => {
    return async (dispatch) => {
        await unujobs.get(`type_aportacion`, {}, ctx)
        .then(res =>  dispatch({ type: typeAportacionActionsTypes.TYPE_APORTACION, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}