import { unujobs } from '../apis';


export const getPlame = async (ctx) => {
    let { year, mes } = ctx.query;
    return await unujobs.get(`plame/${year}/${mes}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({
        success: false,
        status: err.status || 501,
        message: err.message
    }));
} 