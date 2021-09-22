import { escalafon } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class ReportProvider extends BaseProvider  {

    collection = "reports";

    general = async (query = {}, config = {  responseType: 'blob' }, ctx = null) => {
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : "";
        let query_string = `cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}`;
        // request
        return await escalafon.get(`${this.collection}/general?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

}

export default ReportProvider;