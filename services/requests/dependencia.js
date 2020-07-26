import { recursoshumanos } from '../apis';
import { getId } from './index';


export const getDependencia = async (ctx) => {
    let { page, query_search } = ctx.query;
    return await recursoshumanos.get(`dependencia?page=${page || 1}&query_search=${query_search || ""}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({
            success: false,
            status: err.status || 501,
            message: err.message,
            convocatoria: {
                page: 1,
                last_page: 1,
                data: []
            }
        }));
}