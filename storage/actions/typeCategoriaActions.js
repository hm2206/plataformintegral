import {  unujobs } from '../../services/apis';


export const typeCategoriaActionsTypes = {
    PAGE_TYPE_CATEGORIA: 'PAGE_TYPE_CATEGORIA',
    CLEAR_TYPE_CATEGORIA: 'CLEAR_TYPE_CATEGORIA'
};


export const pageTypeCategoria = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`type_categoria?page=${query.page}`, {}, ctx)
        .then(res =>  {
            let { type_categorias } = res.data;
            return dispatch({ type: typeCategoriaActionsTypes.PAGE_TYPE_CATEGORIA, payload: type_categorias })
        })
        .catch(err => console.log(err.message));
    }
}