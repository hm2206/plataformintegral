import {  authentication } from '../../services/apis';


export const permissionActionsTypes = {
    PAGE_PERMISSION: 'PAGE_PERMISSION',
    CLEAR_PERMISSION: 'CLEAR_PERMISSION'
};


export const pagePermission = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await authentication.get(`permission?page=${query.page || 1}&query_search=${query.query_search || ""}`, {}, ctx)
        .then(res =>  dispatch({ type: permissionActionsTypes.PAGE_PERMISSION, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}