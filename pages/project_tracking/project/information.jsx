import React, { useContext, useEffect } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import { AppContext } from '../../../contexts/AppContext';
import { backUrl } from '../../../services/utils';
import dynamic from 'next/dynamic';
const TabProject = dynamic(() => import('../../../components/project-tracking/TabProject'), { ssr: false });
import { Body, BtnBack } from '../../../components/Utils';
import { ProjectProvider } from '../../../contexts/project-tracking/ProjectContext';
import atob from 'atob';
import Router from 'next/router';

//  componente principal
const InformationProject = ({ success, project }) => {
    
    // app
    const app_context = useContext(AppContext);
    
    // primera carga
    useEffect(() => {
        app_context.fireEntity({ render: true, disabled: true });
    }, []);

    // render
    return (
        <div className="col-md-12">
            <Body>
                <div className="card">
                    <div className="card-header bg-primary">
                        <BtnBack onClick={(e) => Router.push({ pathname: backUrl(Router.pathname) })}/> <b className="capitalize text-white">{project && project.title}</b>
                    </div>
                    <div className="card-body">
                        <ProjectProvider value={{ project }}>
                            <TabProject/>
                        </ProjectProvider>
                    </div>
                </div>
            </Body>
        </div>
    )
}

// server rendering
InformationProject.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let id = atob(ctx.query.id) || '__error';
    let { success, project } = await projectTracking.get(`project/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => err.response.data)
        .catch(err => ({ success: false }));
    // response
    return { success, project: project || {} };
}

export default InformationProject;