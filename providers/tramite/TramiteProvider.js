import { tramite } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class TramiteProvider extends BaseProvider  {

    collection = "tramite";

    index = async (query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
        let query_string = `page=${query.page}&query_search=${query.query_search}`;
        return await tramite.get(`${this.collection}?${query_string}`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    verify = async (id, body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}/verify`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    archived = async (id, archived = 1, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}/archived?_method=PUT`, { archived }, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    update = async (id, body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}?_method=PUT`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    delete = async (id, body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}?_method=DELETE`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    toggleCurrent = async (id, body = {}, config = {}, ctx = null) => {
        body.status = typeof body.status != 'undefined' ? body.status : 'enabled';
        return await tramite.post(`${this.collection}/${id}/toggle_current?_method=PUT`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    trackings = async (id, query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        return await tramite.get(`${this.collection}/${id}/trackings?${query_string}`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default TramiteProvider;