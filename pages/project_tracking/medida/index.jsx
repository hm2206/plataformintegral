import React from 'react';
import { Body, BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { system_store } from '../../../services/verify.json';
import { projectTracking } from '../../../services/apis';
import Datatable from '../../../components/datatable';
import { AppContext } from '../../../contexts/AppContext';
import Router from 'next/router';
import btoa from 'btoa';

const IndexMedida = ({ success, medidas }) => {

    // handle options
    const getOption = async (obj, key, index) => {
        switch (key) {
            case 'information':
            case 'edit':
                let id = btoa(obj.id);
                // console.log(Router.pathname)
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
                    titulo="Lista de Medidas"
                    isFilter={false}
                    headers={["#ID", "Nombre Corto", "Nombre", "Estado"]}
                    index={[
                        { key: "id", type: "text" },
                        { key: "name_short", type: "text" },
                        { key: "name", type: "text" },
                        { key: "state", type: "switch", bg_true: "success", is_true: "Activo", bg_false: "danger", is_false: "Desactivado" }
                    ]}
                    data={success ? medidas.data : []}
                    options={[
                        {
                            key: "edit",
                            icon: "fas fa-pencil-alt",
                            title: "Editar Plan de Trabajo"
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
IndexMedida.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    await VERIFY(ctx, system_store.PROJECT_TRACKING);
    let { success, medidas } = await projectTracking.get(`medida`, {}, ctx)
        .then(res => res.data)
        .catch(err => err.response.data)
        .catch(err => ({ success: false }));
    // response
    return { success, medidas: medidas || {} };
}

export default IndexMedida;