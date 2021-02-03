import React, { useContext, useEffect } from 'react';
import { Body, BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import Datatable from '../../../components/datatable';
import { AppContext } from '../../../contexts/AppContext';
import Router from 'next/router';
import btoa from 'btoa';

const IndexProject = ({ success, projects }) => {

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
                titulo="Lista de Proyectos"
                isFilter={false}
                headers={["#ID", "Titulo", "F. Incio", "F. Término", "Duración", "Costo del Proyecto"]}
                index={[
                    { key: "id", type: "text" },
                    { key: "title", type: "text" },
                    { key: "date_start", type: "date" },
                    { key: "date_over", type: "date" },
                    { key: "duration", type: "icon" },
                    { key: "monto", type: "icon", bg: "dark" }
                ]}
                data={success ? projects.data : []}
                options={[
                    { 
                        key: "information",
                        icon: "fas fa-info",
                        title: "Mostrar más información del proyecto"  
                    },
                    { 
                        key: "edit",
                        icon: "fas fa-pencil-alt",
                        title: "Editar Proyecto"  
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
IndexProject.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    // obtener queries y pathname
    let { pathname, query } = ctx;
    await VERIFY(ctx, "PROJECT_TRACKING", pathname);
    let { success, projects } = await projectTracking.get(`project`, {}, ctx)
        .then(res => res.data)
        .catch(err => err.response.data)
        .catch(err => ({ success: false }));
    // response
    return { pathname, query, success, projects: projects || {} };
}

export default IndexProject;