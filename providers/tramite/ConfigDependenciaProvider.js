import { tramite } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class ConfigDependenciaProvider extends BaseProvider  {

    collection = "config_dependencias";

    index = async (query = { page: 1 }, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // response
        return await tramite.get(`${this.collection}?${query_string}`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    store = async (body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    dependenciaDestino = async (id, query = { page: 1 }, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // response
        return await tramite.get(`${this.collection}/${id}/dependencia_destino?${query_string}`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    delete = async (id, body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}?_method=DELETE`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    update = async (id, body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}?_method=PUT`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default ConfigDependenciaProvider;