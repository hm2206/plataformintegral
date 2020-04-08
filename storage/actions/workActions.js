import NextCookies from 'next-cookies';
import { authentication, unujobs } from '../../services/apis';
import atob from 'atob';

export const workActionsTypes = {
    FIND_WORK: "FIND_WORK"
};


export const findWork = (ctx) => {
    return async (dispatch) => {
        let Authorization = `Bearer ${NextCookies(ctx)['auth_token']}`;
        let id = ctx.query.id ? await atob(ctx.query.id) : "error";
        await unujobs.get(`work/${id}`, { headers: { Authorization } })
        .then(res => dispatch({ type: workActionsTypes.FIND_WORK, payload: res.data }))
        .catch(err => {
            ctx.res.writeHead(301, { Location: "/error" });
            ctx.res.end();
            ctx.res.finished = true;
        });
    }
}