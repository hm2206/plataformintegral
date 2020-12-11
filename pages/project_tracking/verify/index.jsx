import React, { useContext, useEffect, useState } from 'react';
import { Body, BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import Datatable from '../../../components/datatable';
import { AppContext } from '../../../contexts/AppContext';
import Router from 'next/router';
import btoa from 'btoa';
import { SelectProject } from '../../../components/select/project_tracking';

const IndexVerify = ({ success, projects }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [project_id, setProjectId] = useState("");

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
                titulo="Lista de Actividades"
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
            >
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <SelectProject
                            name="project_id"
                            value={project_id}
                            onChange={(e, obj) => setProjectId(obj.value)}
                        />
                    </div>

                    <div className="col-md-12">
                        <hr/>
                    </div>
                </div>
            </Datatable>
        </Body>
        
        <BtnFloat
            onClick={(e) => Router.push({ pathname: `${Router.pathname}/create` })} 
        >
            <i className="fas fa-plus"></i>
        </BtnFloat>
    </div>)
}

// server rendering
IndexVerify.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { success, projects } = await projectTracking.get(`project`, {}, ctx)
        .then(res => res.data)
        .catch(err => err.response.data)
        .catch(err => ({ success: false }));
    // response
    return { success, projects: projects || {} };
}

export default IndexVerify;