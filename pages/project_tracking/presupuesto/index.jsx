import React, { useContext, useEffect } from 'react';
import { BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { system_store } from '../../../services/verify.json';
import { projectTracking } from '../../../services/apis';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import BoardSimple from '../../../components/boardSimple';

const IndexPresupuesto = ({ success, presupuestos }) => {

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
            <BoardSimple
                title="Presupuesto"
                info={["Lista de Presupuesto"]}
                options={[]}
                prefix={"P"}
                bg="danger"
            >
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
            </BoardSimple>

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
    await VERIFY(ctx, system_store.PROJECT_TRACKING);
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