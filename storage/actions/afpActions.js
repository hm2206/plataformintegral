import {  unujobs, configAuthorization } from '../../services/apis';


export const afpActionsTypes = {
    ALL_AFP: 'ALL_AFP',
    CLEAR_AFP: 'CLEAR_AFP'
};


export const allAfp = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`afp?estado=${query.estado}`, {}, ctx)
        .then(res =>  dispatch({ type: afpActionsTypes.ALL_AFP, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}