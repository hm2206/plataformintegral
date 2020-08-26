import { tramite } from '../apis';
import { getId } from './index';


export const getTracking = async (ctx, config = {}) => {
    let { status } = ctx.query;
    return await tramite.get(`tracking?status=${status || ""}`, config, ctx)
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


export const getMyTray = async (ctx, config) => {
    let { status } = ctx.query;
    return await tramite.get(`my_tray?status=${status || ""}`, config, ctx)
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