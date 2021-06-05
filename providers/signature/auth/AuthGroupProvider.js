import { signature } from '../../../services/apis';
import BaseProvider from '../../BaseProvider';

class AuthGroupProvider extends BaseProvider  {

    collection = "auth/group";

    index = async (query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // request
        return await signature.get(`${this.collection}?${query_string}`, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

    store = async (body = {}, config = {}, ctx = null) => {
        return await signature.post(`${this.collection}`, body, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

    show = async (id, config = {}, ctx = null) => {
        return await signature.get(`${this.collection}/${id}`, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

    update = async (id, body = {}, config = {}, ctx = null) => {
        return await signature.post(`${this.collection}/${id}?_method=PUT`, body = {}, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

    delete = async (id, body = {}, config = {}, ctx = null) => {
        return await signature.post(`${this.collection}/${id}?_method=DELETE`, body = {}, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

    positions = async (id, config = {}, ctx = null) => {
        return await signature.get(`${this.collection}/${id}/positions`, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

    zip = async (id, body, config = { }, ctx = null) => {
        return await signature.post(`${this.collection}/${id}/zip`, body, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

}

export default AuthGroupProvider;