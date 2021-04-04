import { authentication } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class NotificationProvider extends BaseProvider  {

    collection = "auth/notification";

    index = async (query = { }, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        query.read = typeof query.read != 'undefined' ? query.read : '';
        let query_string = `page=${query.page}&read=${query.read}`;
        return await authentication.get(`${this.collection}?${query_string}`, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));

    }


    show = async (id, config = {}, ctx = null) => {
        return await authentication.get(`${this.collection}/${id}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

}

export default NotificationProvider;