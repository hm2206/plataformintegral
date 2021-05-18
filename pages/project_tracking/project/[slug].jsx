import React, { useContext, useEffect, useState } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import dynamic from 'next/dynamic';
const TabProject = dynamic(() => import('../../../components/project-tracking/TabProject'), { ssr: false });
import { BtnBack } from '../../../components/Utils';
import { ProjectProvider } from '../../../contexts/project-tracking/ProjectContext';
import Router from 'next/router';
import { EntityContext } from '../../../contexts/EntityContext';
import Show from '../../../components/show';
import NotFoundData from '../../../components/notFoundData';
import BoardSimple from '../../../components/boardSimple';
import AddExtension from '../../../components/project-tracking/addExtension';

//  componente principal
const SlugProject = ({ pathname, query, success, project }) => {

    if (!success) return <NotFoundData/>

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [option, setOption] = useState("");

    // primera carga
    useEffect(() => {
        entity_context.fireEntity({ render: true, disabled: true, entity_id: project.entity_id });
        return () => entity_context.fireEntity({ render: false, disabled: false });
    }, []);

    // options
    const handleOptions = (e, index, obj) => {
        switch (obj.key) {
            case 'refresh':
                Router.push(location.href);
                break;
            case 'ampliacion':
                setOption(obj.key);
                break;
            default:
                break;
        }
    }

    // render
    return (
        <div className="col-md-12">
            <ProjectProvider project={project}>
                <BoardSimple
                    prefix={<BtnBack/>}
                    bg="light"
                    title={project?.title || ""}
                    info={["Información detallada del proyecto"]}
                    options={[
                        { key: "refresh", title: "Refrescar", icon: "fas fa-sync" },
                        { key: "ampliacion", title: "Ampliación de Plan de Trabajo", icon: "fas fa-server"},
                        { key: "report-over", title: "Reporte de Cierre", icon: "fas fa-file-alt"},
                    ]}
                    onOption={handleOptions}
                >
                    <div className="card">
                        <div className="card-body">
                            <TabProject/>
                        </div>
                    </div>
                </BoardSimple>
                {/* agregar ampliación */}
                <Show condicion={option == 'ampliacion'}>
                    <AddExtension onClose={() => setOption("")}
                        onSave={() => setOption("")}
                    />
                </Show>
            </ProjectProvider>
        </div>
    )
}

// server rendering
SlugProject.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let slug = query.slug;
    let { success, project } = await projectTracking.get(`project/${slug}?type=code`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, project: {} }));
    // response
    return { pathname, query, success, project };
}

export default SlugProject;