import {  unujobs } from '../../services/apis';


export const dependenciaActionsTypes = {
    ALL_DEPENDENCIAS: 'ALL_DEPENDENCIAS'
};


export const allDependencias = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`dependencia`, {}, ctx)
        .then(res =>  dispatch({ type: dependenciaActionsTypes.ALL_DEPENDENCIAS, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}