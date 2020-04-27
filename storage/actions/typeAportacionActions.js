import {  unujobs, configAuthorization } from '../../services/apis';


export const typeAportacionActionsTypes = {
    TYPE_APORTACION: 'TYPE_APORTACION'
};


export const allTypeAportacion = (ctx) => {
    return async (dispatch) => {
        let Authorization = await configAuthorization(ctx);
        await unujobs.get(`type_aportacion`, { headers: { Authorization } })
        .then(res =>  dispatch({ type: typeAportacionActionsTypes.TYPE_APORTACION, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}