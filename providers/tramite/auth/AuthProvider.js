import { tramite } from '../../../services/apis';
import BaseProvider from '../../BaseProvider';

class AuthProvider extends BaseProvider  {

    collection = "auth";

    status = async (tab, query = {}, config = {}, ctx = null) => {
        return await tramite.get(`auth/status?modo=${tab}`, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

}

export default AuthProvider;