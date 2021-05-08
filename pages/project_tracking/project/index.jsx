import React, { useContext, useEffect, useState } from 'react';
import { BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import Datatable from '../../../components/datatable';
import { AppContext } from '../../../contexts/AppContext';
import Router from 'next/router';
import btoa from 'btoa';
import { EntityContext } from '../../../contexts/EntityContext';
import BoardSimple from '../../../components/boardSimple';
import { Pagination } from 'semantic-ui-react';

const IndexProject = ({ pathname, query, success, projects }) => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [query_search, setQuerySearch] = useState("");

    // primara carga
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // handle options
    const getOption = async (obj, key, index) => {
        switch (key) {
            case 'information':
                Router.push({ pathname: `${Router.pathname}/${obj.code}` });
                break;
            default:
                break;
        }
    }

    // siguiente página
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        query.query_search = query_search;
        await push({ pathname, query });
    }

    // render
    return (
    <div className="col-md-12">
        <BoardSimple
            title="Proyecto"
            info={["Listar Proyectos"]}
            prefix="P"
            bg="danger"
            options={[]}
        >
            <Datatable
                isFilter={false}
                headers={["#ID", "Titulo", "F. Incio", "F. Término", "Duración", "Costo. Proyecto"]}
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
                    }
                ]}
                getOption={getOption}
            >

            </Datatable>
            {/* paginación */}
            <div className="text-center">
                <hr/>
                <Pagination activePage={query.page || 1} 
                    totalPages={projects?.last_page || 1}
                    onPageChange={handlePage}
                />
            </div>
        </BoardSimple>
        
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