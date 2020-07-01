import {  authentication } from '../../services/apis';


export const systemActionsTypes = {
    PAGE_SYSTEM: 'PAGE_SYSTEM',
    CLEAR_SYSTEM: 'CLEAR_SYSTEM'
};


export const pageSystem = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await authentication.get(`system?page=${query.page || 1}&query_search=${query.query_search || ""}`, {}, ctx)
        .then(res =>  dispatch({ type: systemActionsTypes.PAGE_SYSTEM, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}