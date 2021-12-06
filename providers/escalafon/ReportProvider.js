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

    onomastico = async (query = {}, config = {  responseType: 'blob' }, ctx = null) => {
        query.year = typeof query.year != 'undefined' ? query.year : "";
        query.month = typeof query.month != 'undefined' ? query.month : "";
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : "";
        query.type = typeof query.type != 'undefined' ? query.type : "";
        let query_string = `cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}&type=${query.type}&year=${query.year}&month=${query.month}`;
        // request
        return await escalafon.get(`${this.collection}/onomastico?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    ballots = async (query = {}, config = {  responseType: 'blob' }, ctx = null) => {
        query.year =  typeof query.year != 'undefined' ? query.year : currentDate.year();
        query.month =  typeof query.month != 'undefined' ? query.month : '';
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

    licenses = async (query = {}, config = {  responseType: 'blob' }, ctx = null) => {
        query.year =  typeof query.year != 'undefined' ? query.year : currentDate.year();
        query.month =  typeof query.month != 'undefined' ? query.month : currentDate.month() + 1;
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : "";
        query.type = typeof query.type != 'undefined' ? query.type : "";
        let query_string = `year=${query.year}&month=${query.month}&cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}&type=${query.type}`;
        // request
        return await escalafon.get(`${this.collection}/licenses?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    vacations = async (query = {}, config = {  responseType: 'blob' }, ctx = null) => {
        query.year =  typeof query.year != 'undefined' ? query.year : currentDate.year();
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : "";
        query.type = typeof query.type != 'undefined' ? query.type : "";
        let query_string = `year=${query.year}&month=${query.month}&cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}&type=${query.type}`;
        // request
        return await escalafon.get(`${this.collection}/vacations?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    vacationBasics = async (query = {}, config = {  responseType: 'blob' }, ctx = null) => {
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : "";
        query.type = typeof query.type != 'undefined' ? query.type : "";
        let query_string = `${query.month}&cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}&type=${query.type}`;
        // request
        return await escalafon.get(`${this.collection}/vacation_basics?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    infos = async (query = {}, config = {  responseType: 'blob' }, ctx = null) => {
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : "";
        query.type = typeof query.type != 'undefined' ? query.type : "";
        query.year = typeof query.year != 'undefined' ? query.year : currentDate.year();
        query.month = typeof query.month != 'undefined' ? query.month : currentDate.month() + 1;
        let query_string = `cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}&type=${query.type}`;
        query_string += `&year=${query.year}&month=${query.month}`;
        // request
        return await escalafon.get(`${this.collection}/infos?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    schedules = async (query = {}, config = {  responseType: 'blob' }, ctx = null) => {
        query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
        query.type_categoria_id = typeof query.type_categoria_id != 'undefined' ? query.type_categoria_id : "";
        query.type = typeof query.type != 'undefined' ? query.type : "";
        query.year = typeof query.year != 'undefined' ? query.year : currentDate.year();
        query.month = typeof query.month != 'undefined' ? query.month : currentDate.month() + 1;
        let query_string = `cargo_id=${query.cargo_id}&type_categoria_id=${query.type_categoria_id}&type=${query.type}`;
        query_string += `&year=${query.year}&month=${query.month}`;
        // request
        return await escalafon.get(`${this.collection}/schedules?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

}

export default ReportProvider;