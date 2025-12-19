import React, { useContext, useEffect, useState } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import dynamic from 'next/dynamic';
const TabProject = dynamic(() => import('../../../components/project-tracking/TabProject'), { ssr: false });
import { BtnBack } from '../../../components/Utils';
import { ProjectProvider } from '../../../contexts/project-tracking/ProjectContext';
import Router, { useRouter } from 'next/router';
import { EntityContext } from '../../../contexts/EntityContext';
import Show from '../../../components/show';
import NotFoundData from '../../../components/notFoundData';
import BoardSimple from '../../../components/boardSimple';
import AddExtension from '../../../components/project-tracking/addExtension';

//  componente principal
const SlugProject = () => {
    const router = useRouter();
    const { pathname, query } = router;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [project, setProject] = useState({});

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await projectTracking.get(`project/${slug}?type=code`)
            .then(res => {
                setSuccess(res.data.success);
                setProject(res.data.project);
            })
            .catch(err => console.error(err));
        setLoading(false);
    };


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

export default SlugProject;