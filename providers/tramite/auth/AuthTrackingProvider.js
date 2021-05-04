import { tramite } from '../../../services/apis';
import BaseProvider from '../../BaseProvider';

class AuthTramiteProvider extends BaseProvider  {

    collection = "auth/tracking";

    index = async (tab, query = { page: 1, status: [], tracking_id: [] }, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        query.status = typeof query.status == 'object' ? query.status || [] : [];
        query.tracking_id = typeof query.tracking_id == 'object' ? query.tracking_id : [];
        query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
        query.archived = typeof query.archived != 'undefined' ? query.archived : "";
        let query_string = `page=${query.page}&status=${query.status.join('&status=')}&query_search=${query.query_search}&archived=${query.archived}`;
        query_string += `&tracking_id=${query.tracking_id.join('&tracking_id=')}`;
        return await tramite.get(`auth/tracking/${tab}?${query_string}`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default AuthTramiteProvider;