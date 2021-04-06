import { tramite } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class TrackingProvider extends BaseProvider  {

    collection = "tracking";

    verify = async (id, body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}/verify`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default TrackingProvider;