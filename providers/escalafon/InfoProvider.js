import moment from 'moment';
import { escalafon } from '../../services/apis';
import BaseProvider from '../BaseProvider';

class InfoProvider extends BaseProvider  {

    collection = "infos";

    index = async (query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // request
        return await escalafon.get(`${this.collection}?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    store = async (body = {}, config = {}, ctx = null) => {
        return await escalafon.post(`${this.collection}`, body, config, ctx)
        .then(res => res)
        .catch(err => this.handleError(err));
    }

    schedules = async (id, query = {}, config = {}, ctx = null) => {
        query.year = typeof query.year != 'undefined' ? query.year : moment().year();
        query.month = typeof query.month != 'undefined' ? query.month : moment().month() + 1;
        let query_string = `year=${query.year}&month=${query.month}`;
        // request
        return await escalafon.get(`${this.collection}/${id}/schedules?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    asyncSchedules = async (id, body = {}, config = {}, ctx = null) => {
        // request
        return await escalafon.post(`${this.collection}/${id}/sync_schedules`, body, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    ballots = async (id, query = {}, config = {}, ctx = null) => {
        query.year = typeof query.year != 'undefined' ? query.year : moment().year();
        query.month = typeof query.month != 'undefined' ? query.month : moment().month() + 1;
        let query_string = `year=${query.year}&month=${query.month}`;
        // request
        return await escalafon.get(`${this.collection}/${id}/ballots?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    permissions = async (id, query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // request
        return await escalafon.get(`${this.collection}/${id}/permissions?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    licenses = async (id, query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // request
        return await escalafon.get(`${this.collection}/${id}/licenses?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    ascents = async (id, query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // request
        return await escalafon.get(`${this.collection}/${id}/ascents?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    displacements = async (id, query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // request
        return await escalafon.get(`${this.collection}/${id}/displacements?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

    merits = async (id, query = {}, config = {}, ctx = null) => {
        query.page = typeof query.page != 'undefined' ? query.page : 1;
        let query_string = `page=${query.page}`;
        // request
        return await escalafon.get(`${this.collection}/${id}/merits?${query_string}`, config, ctx)
            .then(res => res)
            .catch(err => this.handleError(err));
    }

}

export default InfoProvider;