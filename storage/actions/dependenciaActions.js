import {  recursoshumanos } from '../../services/apis';


export const dependenciaActionsTypes = {
    ALL_DEPENDENCIAS: 'ALL_DEPENDENCIAS',
    CLEAR_DEPENDENCIAS: 'CLEAR_DEPENDENCIAS'
};


export const allDependencias = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await recursoshumanos.get(`dependencia`, {}, ctx)
        .then(res =>  dispatch({ type: dependenciaActionsTypes.ALL_DEPENDENCIAS, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}