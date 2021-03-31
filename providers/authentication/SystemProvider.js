import { authentication } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class SystemProvider extends BaseProvider  {

    index = async (query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // request
        return await authentication.get(`system?${query_string}`, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

    show = async (id, config = {}, ctx = null) => {
        return await authentication.get(`system/${id}`, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

}

export default SystemProvider;