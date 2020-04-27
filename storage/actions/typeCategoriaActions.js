import {  unujobs, configAuthorization } from '../../services/apis';


export const typeCategoriaActionsTypes = {
    PAGE_TYPE_CATEGORIA: 'PAGE_TYPE_CATEGORIA'
};


export const pageTypeCategoria = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        let Authorization = await configAuthorization(ctx);
        await unujobs.get(`type_categoria?page=${query.page}`, { headers: { Authorization } })
        .then(res =>  dispatch({ type: typeCategoriaActionsTypes.PAGE_TYPE_CATEGORIA, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}