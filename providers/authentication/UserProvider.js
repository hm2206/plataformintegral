import { authentication } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class UserProvider extends BaseProvider  {

    permissions = async (id, config = {}, ctx = null) => {
        return await authentication.get(`user/${id}/permissions`, config, ctx)
            .then(res => res.data)
            .catch(err => this.handleError(err));
    }

}

export default UserProvider;