import { authentication } from '../apis';
import { getId } from './index';


export const getSede = async (ctx, config = {}) => {
    let { page, query_search } = ctx.query;
    return await authentication.get(`sede?page=${page || 1}&query_search=${query_search || ""}`, config, ctx)
        .then(res => res.data)
        .catch(err => ({
            success: false,
            message: err.message,
            status: err.status || 501,
            sede: {
                total: 0,
                page: 1,
                lastPage: 0,
                data: []
            }
        }));
}