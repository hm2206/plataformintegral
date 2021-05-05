import { signature } from '../../../services/apis';
import BaseProvider from '../../BaseProvider';

class TeamProvider extends BaseProvider  {

    collection = "notification/team";

    show = async (id, config = {}, ctx = null) => {
        return await signature.get(`${this.collection}/${id}`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    files = async (id, query = { page: 1 }, config = {}, ctx = null) => {
        return await signature.get(`${this.collection}/${id}/files`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    verify = async (id, config = {}, ctx = null) => {
        return await signature.post(`${this.collection}/${id}/verify?_method=PUT`, {}, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default TeamProvider;