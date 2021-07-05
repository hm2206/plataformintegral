import { tramite } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class RoleProvider extends BaseProvider  {

    collection = "roles";

    index = async (query = { page: 1 }, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        query.dependencia_id = typeof query.dependencia_id != 'undefined' ? query.dependencia_id : '';
        let query_string = `page=${query.page}&dependencia_id=${query.dependencia_id}`;
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

    disabled = async (id, body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}/disabled?_method=PUT`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    update = async (id, body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}?_method=PUT`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default RoleProvider;