import { authentication } from '../apis';
import { getId } from './index';


export const findDependencia = async (ctx) => {
    let id = getId(ctx);
    return await authentication.get(`dependencia/${id}`)
        .then(res => res.data)
        .catch(err => ({
            success: false,
            status: err.status || 501,
            message: err.message,
            dependencia: {}
        }));
}

export const getDependencia = async (ctx) => {
    let { page, query_search, type } = ctx.query;
    return await authentication.get(`dependencia?page=${page || 1}&query_search=${query_search || ""}&type=${type || ""}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({
            success: false,
            status: err.status || 501,
            message: err.message,
            dependencia: {
                total: 0,
                page: 1,
                lastPage: 1,
                data: []
            }
        }));
}