import { recursoshumanos } from '../apis';
import { getId } from './index';


export const findDependencia = async (ctx) => {
    let id = getId(ctx);
    return await recursoshumanos.get(`dependencia/${id}`)
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
    return await recursoshumanos.get(`dependencia?page=${page || 1}&query_search=${query_search || ""}&type=${type || ""}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({
            success: false,
            status: err.status || 501,
            message: err.message,
            dependencia: {
                page: 1,
                last_page: 1,
                data: []
            }
        }));
}