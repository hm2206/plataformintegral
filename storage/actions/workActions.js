import { authentication, unujobs } from '../../services/apis';
import atob from 'atob';

export const workActionsTypes = {
    FIND_WORK: "FIND_WORK",
    PAGE_WORK: "PAGE_WORK",
    CLEAR_WORK: "CLEAR_WORK"
};


export const findWork = (ctx) => {
    return async (dispatch) => {
        let id = ctx.query.id ? await atob(ctx.query.id) : "error";
        await unujobs.get(`work/${id}`, {}, ctx)
        .then(res => dispatch({ type: workActionsTypes.FIND_WORK, payload: res.data }));
    }
}

export const pageWork = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await unujobs.get(`work?page=${query.page || ""}&query_search=${query.query_search || ""}`, {}, ctx)
        .then(res => dispatch({ type: workActionsTypes.PAGE_WORK, payload: res.data }));
    }
}