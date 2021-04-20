import { clock } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class ClockProvider extends BaseProvider  {

    collection = "assistance";

    index = async (query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // request
        return await clock.get(`${this.collection}?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    store = async (body = {}, config = {}, ctx = null) => {
        return await clock.post(`${this.collection}`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default ClockProvider;