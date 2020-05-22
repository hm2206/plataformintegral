import {  unujobs, configAuthorization } from '../../services/apis';
import atob from 'atob';


export const convocatoriaActionsTypes = {
    PAGE_CONVOCATORIA: 'PAGE_CONVOCATORIA',
    CONVOCATORIA: 'CONVOCATORIA',
};


export const pageConvocatoria = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let Authorization = await configAuthorization(ctx);
        await unujobs.get(`convocatoria?estado=${query.estado}&year=${query.year}&mes=${query.mes}`, { headers: { Authorization } })
        .then(res =>  dispatch({ type: convocatoriaActionsTypes.PAGE_CONVOCATORIA, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}


export const findConvocatoria = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let Authorization = await configAuthorization(ctx);
        query.id = atob(query.id || '_error');
        await unujobs.get(`convocatoria/${query.id}`, { headers: { Authorization } })
        .then(res =>  dispatch({ type: convocatoriaActionsTypes.CONVOCATORIA, payload: res.data }))
    }
}