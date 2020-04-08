import NextCookies from 'next-cookies';
import { unujobs } from '../../services/apis';
import atob from 'atob';


export const cronogramaActionsTypes = {
    FIND_CRONOGRAMA: 'FIND_CRONOGRAMA'
};

export const findCronograma = (ctx) => {
    return async (dispatch) => {
        let Authorization = `Bearer ${NextCookies(ctx)['auth_token']}`;
        let { page, like, cargo_id, type_categoria_id } = ctx.query;
        let id = ctx.query.id ? await atob(ctx.query.id) : "error";
        let params = `page=${page ? page : 1}&like=${like ? like : ''}&cargo_id=${cargo_id ? cargo_id : ''}&type_categoria_id=${type_categoria_id ? type_categoria_id : ''}`;
        let path = `cronograma/${id}?${params}`;
        await unujobs.get(path, { headers: { Authorization } })
        .then(res => dispatch({ type: cronogramaActionsTypes.FIND_CRONOGRAMA, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}