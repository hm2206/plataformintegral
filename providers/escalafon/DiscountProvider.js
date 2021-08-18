import { escalafon } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class DiscountProvider extends BaseProvider  {

    collection = "discounts";

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
    
    preView = async (year, month, query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : '';
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : '';
        let query_string = `page=${query.page}&query_search=${query.query_search}&cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}`;
        // request
        return await escalafon.get(`${this.collection}/${year}/${month}/pre_view?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    preViewDetails = async (year, month, query = {}, config = {}, ctx = null) => {
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : '';
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : '';
        let query_string = `cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}`
        // request
        return await escalafon.get(`${this.collection}/${year}/${month}/pre_view_details?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    process = async (year, month, body = {}, config = {}, ctx = null) => {
        return await escalafon.post(`${this.collection}/${year}/${month}/process`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default DiscountProvider;