import { tramite } from '../apis';
import { getId } from './index';


export const getTracking = async (ctx, config = {}) => {
    let { status, page, query_search } = ctx.query;
    return await tramite.get(`tracking?status=${status || ""}&page=${page || 1}&query_search=${query_search || ""}`, config, ctx)
        .then(res => res.data)
        .catch(err => ({
            success: false,
            status: err.status || 501,
            code: err.code || 'ERR',
            message: err.message,
            tracking: {
                total: 0,
                page: 1,
                lastPage: 1,
                data: []
            }
        }));
}


export const getMyTray = async (ctx, config = {}) => {
    let { status, page, query_search } = ctx.query;
    return await tramite.get(`my_tray?status=${status || ""}&page=${page || 1}&query_search=${query_search || ""}`, config, ctx)
        .then(res => res.data)
        .catch(err => ({
            success: false,
            status: err.status || 501,
            code: err.code || 'ERR',
            message: err.message,
            tracking: {
                total: 0,
                page: 1,
                lastPage: 1,
                perPage: 0,
                data: []
            }
        }));
}

export const getTramiteType = async (ctx) => {
    let { state, page, query_search } = ctx.query;
    return await tramite.get(`tramite_type?page=${page || 1}&state=${state || 1}&query_search=${query_search || ""}`)
        .then(res => res.data)
        .catch(err => ({
            success: false,
            message: err.message,
            tramite_type: {
                total: 0,
                page: 1,
                lastPage: 1,
                perPage: 0,
                data: []
            }
        }));
}