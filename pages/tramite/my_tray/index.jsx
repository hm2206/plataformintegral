import React, { Component, Fragment } from 'react';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import Swal from 'sweetalert2';
import { getMyTray } from '../../../services/requests/tramite';
import TableTracking from '../../../components/tramite/tableTracking';
import { tramite } from '../../../services/apis';
import { BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import ModalSend from '../../../components/tramite/modalSend';


export default class TrackingIndex extends Component {


    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname } = ctx;
        query.status = query.status || 'PENDIENTE';
        let { success, tracking } = query.dependencia_id ? await getMyTray(ctx, { headers: { DependenciaId: query.dependencia_id || "" } })  : {};
        return {query, pathname, success: success || false, tracking: tracking || {} };
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

    // componentWillReceiveProps = (nextProps) => {
    //     this.getStatus(nextProps.query.dependencia_id);
    // }

    setStatusLoading = async (new_status_count = this.state.status_count) => {
        let status_count = Object.assign(this.state.status_count, new_status_count);
        this.setState({ status_count });
    }

    getStatus = async (DependenciaId) => {
        this.setStatusLoading({ loading: true });
        await tramite.get('status/bandeja', { headers: { DependenciaId } })
            .then(res => {
                let { success, message, status_count } = res.data;
                if (!success) throw new Error(message);
                this.setStatusLoading({ data: status_count }); 
            }).catch(err => console.log(err));
            this.setStatusLoading({ loading: false });
    }

    render() {

        let { isLoading, pathname } = this.props;

        return <Fragment>
            <TableTracking 
                {...this.props} 
                titulo="Bandeja de Entrada"
                status_count={this.state.status_count}
                onSearch={(e) => this.getStatus(e || "")}
            />
            {/* crear nuevo buzón */}
            <BtnFloat
                disabled={isLoading}
                onClick={(e) => {
                Router.push({ pathname: `${pathname}/create`, query:  { clickb: "my_tray" }});
            }}
            >
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </Fragment>
    }

}
