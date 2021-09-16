import moment from 'moment';
import { escalafon } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class AssistanceProvider extends BaseProvider  {

    collection = "assistances";

    index = async (query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1
        query.year = typeof query.year != 'undefined' ? query.year : moment().format('YYYY')
        query.month = typeof query.month != 'undefined' ? query.month : moment().format('MM')
        query.day = typeof query.day != 'undefined' ? query.day : moment().format('DD')
        query.query_search = typeof query.query_search != 'undefined' ? query.query_search : ""
        let query_string = `page=${query.page}&year=${query.year}&month=${query.month}&day=${query.day}&query_search=${query.query_search}`;
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

    reportMonthly = async (query = {}, config = { }, ctx = null) => {
        config.responseType = 'blob';
        let date = moment()
        query.year = typeof query.year != 'undefined' ? query.year : date.year()
        query.month = typeof query.month != 'undefined' ? query.month : date.month() + 1
        query.day = typeof query.day != 'undefined' ? query.day : '';
        query.query_search = typeof query.query_search != 'undefined' ? query.query_search : ""
        let query_string = `year=${query.year}&month=${query.month}&day=${query.day}&query_search=${query.query_search}`;
        // request
        return await escalafon.get(`${this.collection}/report/monthly?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

}

export default AssistanceProvider;