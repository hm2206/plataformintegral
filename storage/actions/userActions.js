import {  authentication } from '../../services/apis';


export const userActionsTypes = {
    PAGE_USER: 'PAGE_USER',
    CLEAR_USER: 'CLEAR_USER'
};


export const pageUser = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await authentication.get(`user?page=${query.page || 1}&query_search=${query.query_search || ""}&state=${query.estado || 1}`, {}, ctx)
        .then(res =>  dispatch({ type: userActionsTypes.PAGE_USER, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}