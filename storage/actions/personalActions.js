import {  unujobs } from '../../services/apis';


export const personalActionsTypes = {
    PAGE_PERSONAL: 'PAGE_PERSONAL',
    FIND_PERSONAL: 'FIND_PERSONAL',
    CLEAR_PERSONAL: 'CLEAR_PERSONAL'
};


export const pagePersonal = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`personal?year=${query.year}&mes=${query.mes}`, {}, ctx)
        .then(res =>  dispatch({ type: personalActionsTypes.PAGE_PERSONAL, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}


export const findPersonal = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let path = `personal/${query.id || '_error'}`;
        await unujobs.get(`personal/${query.id || '_error'}`, {}, ctx)
        .then(res =>  dispatch({ type: personalActionsTypes.FIND_PERSONAL, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}