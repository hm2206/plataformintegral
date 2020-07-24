import { recursoshumanos } from '../apis';
import { getId } from './index';

export const getStaff = async (ctx) => {
    let { page, estado, year, mes } = ctx.query;
    return await recursoshumanos.get(`staff_requirement?page=${page}&estado=${estado}&year=${year}&mes=${mes}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({
            success: false,
            code: 501,
            message: error.message,
            staff: {
                page: 1,
                lastPage: 1,
                data: []
            }
        }));
}