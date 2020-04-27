import {  unujobs, configAuthorization } from '../../services/apis';


export const typeSindicatoActionsTypes = {
    TYPE_SINDICATO: 'TYPE_SINDICATO'
};


export const allTypeSindicato = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let Authorization = await configAuthorization(ctx);
        await unujobs.get(`type_sindicato`, { headers: { Authorization } })
        .then(res =>  dispatch({ type: typeSindicatoActionsTypes.TYPE_SINDICATO, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}