import React, { useContext } from 'react';
import { Body, BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { system_store } from '../../../services/verify.json';
import { projectTracking } from '../../../services/apis';
import Datatable from '../../../components/datatable';
import { AppContext } from '../../../contexts/AppContext';
import Router from 'next/router';
import btoa from 'btoa';

const IndexRubro = ({ success, medio_pagos }) => {

    // app
    const app_context = useContext(AppContext);

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
                titulo="Lista de Medio de Pagos"
                isFilter={false}
                headers={["#ID", "Nombre","Mas Información", "Estado"]}
                index={[
                    { key: "id", type: "text" },
                    { key: "name", type: "text" },
                    { key: "is_info", type: "switch", bg_true: "success", is_true: "Activo", bg_false: "danger", is_false: "Desactivado" },
                    { key: "state", type: "switch", bg_true: "success", is_true: "Activo", bg_false: "danger", is_false: "Desactivado" }
                ]}
                data={success ? medio_pagos.data : []}
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
IndexRubro.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    await VERIFY(ctx, system_store.PROJECT_TRACKING);
    let { success, medio_pagos } = await projectTracking.get(`medio_pago`, {}, ctx)
        .then(res => res.data)
        .catch(err => err.response.data)
        .catch(err => ({ success: false }));
    // response
    return { success, medio_pagos: medio_pagos || {} };
}

export default IndexRubro;