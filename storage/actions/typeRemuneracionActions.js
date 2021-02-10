import {  unujobs } from '../../services/apis';


export const typeRemuneracionActionsTypes = {
    PAGE_TYPE_REMUNERACION: 'PAGE_TYPE_REMUNERACION',
    CLEAR_TYPE_REMUNERACION: 'CLEAR_TYPE_REMUNERACION'
};


export const pageTypeRemuneracion = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`type_remuneracion?page=${query.page}`, {}, ctx)
        .then(res =>  {
            let { type_remuneraciones } = res.data;
            return dispatch({ type: typeRemuneracionActionsTypes.PAGE_TYPE_REMUNERACION, payload: type_remuneraciones });
        })
        .catch(err => console.log(err.message));
    }
}