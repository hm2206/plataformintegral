import { unujobs } from '../apis';


export const getPlame = async (ctx) => {
    let { year, mes } = ctx.query;
    return await unujobs.get(`plame/${year}/${mes}`, {}, ctx)
    .then(res => res.data)
    .catch(err => {
        let { data } = err.response;
        if (typeof data != 'object') throw new Error(err.message);
        throw new Error(data.message);
    }).catch(err => ({
        success: false,
        status: err.status || 501,
        message: err.message,
        cronogramas: []
    }));
} 