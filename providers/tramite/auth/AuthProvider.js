import { tramite } from '../../../services/apis';
import BaseProvider from '../../BaseProvider';

class AuthProvider extends BaseProvider  {

    collection = "auth";

    status = async (tab, query = {}, config = {}, ctx = null) => {
        query.archived = typeof query.archived != 'undefined' ? query.archived : '';
        let query_string = `archived=${query.archived}`;
        return await tramite.get(`auth/status?modo=${tab}&${query_string}`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default AuthProvider;