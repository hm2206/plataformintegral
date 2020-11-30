import React, { useState, useEffect, useContext } from 'react';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import Swal from 'sweetalert2';
import { getMyTray } from '../../../services/requests/tramite';
import TableTracking from '../../../components/tramite/tableTracking';
import { tramite } from '../../../services/apis';
import { BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import ModalSend from '../../../components/tramite/modalSend';
import { AppContext } from '../../../contexts/AppContext';
import { TrackingProvider } from '../../../contexts/tracking/TrackingContext';


const IndexMyTray = ({ success, tracking, query }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [current_status, setCurrentStatus] = useState({});
    const [role, setRole] = useState({});

    // primera carga
    useEffect(() => {
        app_context.fireEntity({ render: true });
    }, []);

    // vaciar estatus al cambiar la entidad
    useEffect(() => {
        setCurrentStatus({});
    }, [app_context.entity_id]);

    // obtener el estatus
    useEffect(() => {
        if (app_context.entity_id && query.dependencia_id && query.status && !refresh) getStatus(query.dependencia_id);
        else setCurrentStatus({});
    }, [query.dependencia_id, app_context.entity_id, query.status, query.query_search]);

    // refresh
    useEffect(() => {
        if (refresh) getStatus(query.dependencia_id);
    }, [refresh]);

    // obtener el estado del traking seleccionado
    const getStatus = async (DependenciaId) => {
        setCurrentLoading(true);
        await tramite.get('status/bandeja', { headers: { DependenciaId } })
            .then(res => {
                let { success, message, status_count } = res.data;
                if (!success) throw new Error(message);
                setCurrentStatus(status_count);
            }).catch(err => console.log(err));
        setCurrentLoading(false);
        setRefresh(false);
    }

    // render
    return <TrackingProvider value={{ 
        current_loading,
        current_status,
        tracking,
        setRefresh,
        success,
        role, 
        setRole
    }}>
        <TableTracking 
            title="Mi tramite"
            query={query}
            url={"my_tray"}
        />
        <BtnFloat onClick={(e) => {
            let { push, pathname } = Router;
            push({ pathname: `${pathname}/create` });
        }}>
            <i className="fas fa-plus"></i>
        </BtnFloat>
    </TrackingProvider>;
}

// server rendering
IndexMyTray.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query } = ctx;
    query.dependencia_id = typeof query.dependencia_id != 'undefined' ? query.dependencia_id : "";
    query.status = typeof query.status != 'undefined' ? query.status : 'REGISTRADO';
    let success = false;
    let tracking = {};
    if (query.dependencia_id) {
        let datos = await getMyTray(ctx, { headers: { DependenciaId: query.dependencia_id } })
        success = datos.success || false;
        tracking = datos.tracking || {};
    }
    // response
    return { query, success, tracking }
}

export default IndexMyTray;