import { escalafon } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class WorkProvider extends BaseProvider  {

    collection = "works";

    index = async (query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // request
        return await escalafon.get(`${this.collection}?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    store = async (body = {}, config = {}, ctx = null) => {
        return await escalafon.post(`${this.collection}`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    update = async (id, body = {}, config = {}, ctx = null) => {
        return await escalafon.post(`${this.collection}/${id}?_method=PUT`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    delete = async (id, body = {}, config = {}, ctx = null) => {
        return await escalafon.post(`${this.collection}/${id}?_method=DELETE`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    degrees = async (id, query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // request
        return await escalafon.get(`${this.collection}/${id}/degrees?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    reportVacations = async (id, query = { year: [] }, config = {  responseType: 'blob' }, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        query.type = typeof query.type != 'undefined' ? query.type : 'pdf';
        let query_string = `page=${query.page}&type=${query.type}`;
        query?.year?.forEach(y => {
            query_string += `&year=${y}`;
        });
        // request
        return await escalafon.get(`${this.collection}/${id}/report_vacations?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

}

export default WorkProvider;