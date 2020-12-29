import React, { useContext, useEffect } from 'react';
import { Body, BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import Datatable from '../../../components/datatable';
import { AppContext } from '../../../contexts/AppContext';
import Router from 'next/router';
import btoa from 'btoa';

const IndexPresupuesto = ({ success, presupuestos }) => {

    // app
    const app_context = useContext(AppContext);

    // quitar entity filter
    useEffect(() => {
        app_context.fireEntity({ render: false });
    }, []);

    // handle options
    const getOption = async (obj, key, index) => {
        switch (key) {
            case 'information':
            case 'edit':
                let id = btoa(obj.id);
                Router.push({ pathname: `${Router.pathname}/${key}`, query: { id } });
                break;
            default:
                break;
        }
    }

    // render
    return (
        <div className="col-md-12">
            <Body>
                <Datatable
                    titulo="Lista de Presupuesto"
                    isFilter={false}
                    headers={["#ID", "Nombre", "Ext. Presupuestal", "Estado"]}
                    index={[
                        { key: "id", type: "text" },
                        { key: "name", type: "text" },
                        { key: "ext_pptto", type: "text" },
                        { key: "state", type: "switch", bg_true: "success", is_true: "Activo", bg_false: "danger", is_false: "Desactivado" }
                    ]}
                    data={success ? presupuestos.data : []}
                    options={[
                        {
                            key: "edit",
                            icon: "fas fa-pencil-alt",
                            title: "Editar Presupuesto"
                        }
                    ]}
                    getOption={getOption}
                />
            </Body>

            <BtnFloat
                onClick={(e) => Router.push({ pathname: `${Router.pathname}/create` })}
            >
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </div>)
}

// server rendering
IndexPresupuesto.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    let { success, presupuestos } = await projectTracking.get(`presupuesto?page=${query.page}`, {}, ctx)
        .then(res => res.data)
        .catch(err => err.response.data)
        .catch(err => ({ success: false }));
    // response
    return { success, presupuestos: presupuestos || {} };
}

export default IndexPresupuesto;