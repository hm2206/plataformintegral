import React, { useContext, useEffect } from 'react';
import { Body, BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import Datatable from '../../../components/datatable';
import { AppContext } from '../../../contexts/AppContext';
import Router from 'next/router';
import btoa from 'btoa';

const IndexPlanTrabajo = ({ success, plan_trabajos }) => {

    // app
    const app_context = useContext(AppContext);

    // primara carga
    useEffect(() => {
        app_context.fireEntity({ render: true });
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
                titulo="Lista de Plan de Trabajos"
                isFilter={false}
                headers={["#ID", "Proyecto", "F. Incio", "F. Término", "Duración", "Estado"]}
                index={[
                    { key: "id", type: "text" },
                    { key: "project.code", type: "text" },
                    { key: "date_start", type: "date" },
                    { key: "date_over", type: "date" },
                    { key: "duration", type: "icon" },
                    { key: "state", type: "icon", bg: "warning" }
                ]}
                data={success ? plan_trabajos.data : []}
                options={[
                    // { 
                    //     key: "information",
                    //     icon: "fas fa-info",
                    //     title: "Mostrar más información del plan de trabajo"  
                    // },
                    // { 
                    //     key: "edit",
                    //     icon: "fas fa-pencil-alt",
                    //     title: "Editar Plan de Trabajo"  
                    // }
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
IndexPlanTrabajo.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { success, plan_trabajos } = await projectTracking.get(`plan_trabajo`, {}, ctx)
        .then(res => res.data)
        .catch(err => err.response.data)
        .catch(err => ({ success: false }));
    // response
    return { success, plan_trabajos: plan_trabajos || {} };
}

export default IndexPlanTrabajo;