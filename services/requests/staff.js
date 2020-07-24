import { recursoshumanos } from '../apis';
import { getId } from './index';

export const getStaff = async (ctx) => {
    try {
        let { page, estado, year, mes } = ctx.query;
        return await recursoshumanos.get(`staff_requirement?page=${page}&estado=${estado}&year=${year}&mes=${mes}`, {}, ctx)
        .then(res => res.data)
    } catch (error) {
        return {
            success: false,
            message: error.message,
            staff: { data: [], page: 1, lastPage: 1 }
        }
    }
}


export const findStaff = async (ctx) => {
    let id = getId(ctx);
    return await recursoshumanos.get(`staff_requirement/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({
        success: false,
        staff: {},
        code: 501,
        message: err.message
    }));
}