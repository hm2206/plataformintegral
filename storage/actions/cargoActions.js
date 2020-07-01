import {  unujobs } from '../../services/apis';


export const cargoActionsTypes = {
    ALL_CARGO: 'ALL_CARGO',
    PAGE_CARGO: 'PAGE_CARGO',
    CLEAR_CARGO: 'CLEAR_CARGO'
};


export const pageCargo = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`cargo?estado=${query.estado}`, {}, ctx)
        .then(res =>  dispatch({ type: cargoActionsTypes.PAGE_CARGO, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}