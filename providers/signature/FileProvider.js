import { signature } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class FileProvider extends BaseProvider  {

    collection = "file";

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
        return await signature.post(`${this.collection}/${id}?_method=PUT`, body, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

    delete = async (id, body = {}, config = {}, ctx = null) => {
        return await signature.post(`${this.collection}/${id}?_method=DELETE`, body, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

}

export default FileProvider;