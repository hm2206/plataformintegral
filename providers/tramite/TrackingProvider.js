import { tramite } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class TrackingProvider extends BaseProvider  {

    collection = "tracking";

    verify = async (id, body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}/verify`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    archived = async (id, archived = 1, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}/archived?_method=PUT`, { archived }, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    update = async (id, body = {}, config = {}, ctx = null) => {
        return await tramite.post(`${this.collection}/${id}?_method=PUT`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default TrackingProvider;