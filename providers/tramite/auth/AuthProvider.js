import { tramite } from '../../../services/apis';
import BaseProvider from '../../BaseProvider';

class AuthProvider extends BaseProvider  {

    collection = "auth";

    status = async (tab, query = {}, config = {}, ctx = null) => {
        query.archived = typeof query.archived != 'undefined' ? query.archived : '';
        query.query_search = typeof query.query_search != 'undefined' ? query.query_search : '';
        let query_string = `archived=${query.archived}&query_search=${query.query_search}`;
        return await tramite.get(`auth/status?modo=${tab}&${query_string}`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default AuthProvider;