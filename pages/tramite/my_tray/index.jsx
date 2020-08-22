import React, { Component, Fragment } from 'react';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Form, Button, Select } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import { getMyTray } from '../../../services/requests/tramite';
import TableTracking from '../../../components/tramite/tableTracking';
import { BtnFloat } from '../../../components/Utils';


export default class TrackingIndex extends Component {


    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname } = ctx;
        query.status = query.status || 'REGISTRADO';
        let { success, tracking } = await getMyTray(ctx, { headers: { DependenciaId: query.dependencia_id || "" } });
        return {query, pathname, success, tracking };
    }

    render() {

        let { isLoading, pathname } = this.props;

        return <Fragment>
            <TableTracking {...this.props}/>
            {/* crear nuevo buzón */}
            <BtnFloat
                disabled={isLoading}
                onClick={(e) => {
                Router.push({ pathname: `${pathname}/create`, query:  { clickb: "cronograma" }});
            }}
            >
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </Fragment>
    }

}
