import { authentication } from '../../services/apis';
import atob from 'atob';

export const personActionsTypes = {
    FIND_PERSON: "FIND_PERSON",
    CLEAR_PERSON: 'FIND_PERSON'
};


export const findPerson = (ctx) => {
    return async (dispatch) => {
        let id = ctx.query.id ? await atob(ctx.query.id) : "error";
        await authentication.get(`find_person/${id}`, {}, ctx)
        .then(res => dispatch({ type: personActionsTypes.FIND_PERSON, payload: res.data }))
    }
}