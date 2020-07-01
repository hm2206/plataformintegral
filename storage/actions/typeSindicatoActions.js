import {  unujobs } from '../../services/apis';


export const typeSindicatoActionsTypes = {
    TYPE_SINDICATO: 'TYPE_SINDICATO',
    CLEAR_TYPE_SINDICATO: 'CLEAR_TYPE_SINDICATO'
};


export const allTypeSindicato = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`type_sindicato`, {}, ctx)
        .then(res =>  dispatch({ type: typeSindicatoActionsTypes.TYPE_SINDICATO, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}