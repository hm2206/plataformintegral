import moment from 'moment';
import { escalafon } from '../../services/apis';
import BaseProvider from '../BaseProvider';

const currentDate = moment();

class ReportProvider extends BaseProvider  {

    collection = "reports";

    general = async (query = {}, config = {  responseType: 'blob' }, ctx = null) => {
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : "";
        query.type = typeof query.type != 'undefined' ? query.type : "";
        let query_string = `cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}&type=${query.type}`;
        // request
        return await escalafon.get(`${this.collection}/general?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    ballots = async (query = {}, config = {  responseType: 'blob' }, ctx = null) => {
        query.year =  typeof query.year != 'undefined' ? query.year : currentDate.year();
        query.month =  typeof query.month != 'undefined' ? query.month : currentDate.month() + 1;
        query.day =  typeof query.day != 'undefined' ? query.day : '';
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : "";
        query.type = typeof query.type != 'undefined' ? query.type : "";
        let query_string = `year=${query.year}&month=${query.month}&day=${query.day}&cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}&type=${query.type}`;
        // request
        return await escalafon.get(`${this.collection}/ballots?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

}

export default ReportProvider;