import { tramite } from '../../../services/apis';
import BaseProvider from '../../BaseProvider';

class AuthTramiteProvider extends BaseProvider  {

    collection = "auth/tramite";

    show = async (id, query = { }, config = {}, ctx = null) => {
        return await tramite.get(`${this.collection}/${id}/tracking`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default AuthTramiteProvider;