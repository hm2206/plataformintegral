import React, { Component } from 'react';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Form, Button, Select } from 'semantic-ui-react';
import Show from '../../../components/show';
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { getTracking } from '../../../services/requests/tramite';
import TableTracking from '../../../components/tramite/tableTracking';


export default class TrackingIndex extends Component {


    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname } = ctx;
        let { success, tracking } = await getTracking(ctx, { headers: { DependenciaId: query.dependencia_id || "" } });
        return {query, pathname, success, tracking };
    }

    render() {
        return <TableTracking {...this.props}/>
    }

}
