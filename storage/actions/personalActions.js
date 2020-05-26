import {  unujobs, configAuthorization } from '../../services/apis';


export const personalActionsTypes = {
    PAGE_PERSONAL: 'PAGE_PERSONAL',
    FIND_PERSONAL: 'FIND_PERSONAL'
};


export const pagePersonal = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let Authorization = await configAuthorization(ctx);
        await unujobs.get(`personal?year=${query.year}&mes=${query.mes}`, { headers: { Authorization } })
        .then(res =>  dispatch({ type: personalActionsTypes.PAGE_PERSONAL, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}


export const findPersonal = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let Authorization = await configAuthorization(ctx);
        let path = `personal/${query.id || '_error'}`;
        await unujobs.get(`personal/${query.id || '_error'}`, { headers: { Authorization } })
        .then(res =>  dispatch({ type: personalActionsTypes.FIND_PERSONAL, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}