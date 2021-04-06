import { tramite } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class TrackingProvider extends BaseProvider  {

    collection = "file";

    store = async (body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default TrackingProvider;