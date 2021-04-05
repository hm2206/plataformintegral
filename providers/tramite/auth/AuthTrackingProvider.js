import { tramite } from '../../../services/apis';
import BaseProvider from '../../BaseProvider';

class AuthTramiteProvider extends BaseProvider  {

    collection = "auth/tracking";

    index = async (tab, query = { page: 1, status: [] }, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        query.status = typeof query.status == 'object' ? query.status || [] : [];
        query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
        let query_string = `page=${query.page}&status=${query.status.join('&status=')}&query_search=${query.query_search}`;
        return await tramite.get(`auth/tracking/${tab}?${query_string}`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default AuthTramiteProvider;