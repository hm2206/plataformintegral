import React, { Component } from 'react';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Form, Button, Select } from 'semantic-ui-react';
import Show from '../../../components/show';
import { tramite } from '../../../services/apis';
import Swal from 'sweetalert2';
import { getTracking } from '../../../services/requests/tramite';
import TableTracking from '../../../components/tramite/tableTracking';


export default class TrackingIndex extends Component {


    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname } = ctx;
        query.status = query.status || 'PENDIENTE';
        let { success, tracking } = query.dependencia_id ? await getTracking(ctx, { headers: { DependenciaId: query.dependencia_id || "" } }) : { success : false }; 
        return {query, pathname, success, tracking };
    }

    state = {
        status_count: {
            loading: false,
            data: {}
        }
    }

    componentDidMount = async () => {
        let { query } = this.props;
        if (query.dependencia_id) await this.getStatus(query.dependencia_id);
    }

    componentWillReceiveProps = (nextProps) => {
        this.getStatus(nextProps.query.dependencia_id);
    }

    setStatusLoading = async (new_status_count = this.state.status_count) => {
        let status_count = Object.assign(this.state.status_count, new_status_count);
        this.setState({ status_count });
    }

    getStatus = async (DependenciaId) => {
        this.setStatusLoading({ loading: true });
        await tramite.get('status/tramite_interno', { headers: { DependenciaId } })
            .then(res => {
                let { success, message, status_count } = res.data;
                if (!success) throw new Error(message);
                this.setStatusLoading({ data: status_count }); 
            }).catch(err => console.log(err));
            this.setStatusLoading({ loading: false });
    }

    render() {
        return <TableTracking 
            {...this.props} 
            titulo="Trámite Interno"
            status_count={this.state.status_count}
        />
    }

}
