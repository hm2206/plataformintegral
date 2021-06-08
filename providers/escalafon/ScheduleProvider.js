import moment from 'moment';
import { escalafon } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class ScheduleProvider extends BaseProvider  {

    collection = "schedules";

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

    replicar = async (id, body = {}, config = {}, ctx = null) => {
        return await escalafon.post(`${this.collection}/${id}/replicar`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default ScheduleProvider;