import { escalafon } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class ConfigDiscountProvider extends BaseProvider  {

    collection = "config_discounts";

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

    show = async (id, config = {}, ctx = null) => {
        return await escalafon.get(`${this.collection}/${id}`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    process_discounts = async (id, body = {}, config = {}, ctx = null) => {
        return await escalafon.post(`${this.collection}/${id}/process_discounts`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    discounts = async (id, query = {}, config = {}, ctx = null) => {
        query.type = typeof query.type != 'undefined' ? query.type : 'json';
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : '';
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : '';
        let query_string = `page=${query.page}&cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}&type=${query.type}`;
        // request
        return await escalafon.get(`${this.collection}/${id}/discounts?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    headDiscounts = async (id, query = {}, config = {}, ctx = null) => {
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : '';
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : '';
        let query_string = `cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}`;
        // request
        return await escalafon.get(`${this.collection}/${id}/head_discounts?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    verified = async (id, body = {}, config = {}, ctx = null) => {
        return await escalafon.post(`${this.collection}/${id}/verified?_method=PUT`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    accepted = async (id, body = {}, config = {}, ctx = null) => {
        return await escalafon.post(`${this.collection}/${id}/accepted?_method=PUT`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default ConfigDiscountProvider;