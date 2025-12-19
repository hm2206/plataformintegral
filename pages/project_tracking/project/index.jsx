import React, { useContext, useEffect, useState } from 'react';
import { BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { projectTracking } from '../../../services/apis';
import Datatable from '../../../components/datatable';
import { AppContext } from '../../../contexts/AppContext';
import Router, { useRouter } from 'next/router';
import { EntityContext } from '../../../contexts/EntityContext';
import BoardSimple from '../../../components/boardSimple';
import { Form, Pagination, Button } from 'semantic-ui-react';
import { SelectTypeProject } from '../../../components/select/project_tracking';

const IndexProject = ({ projects }) => {
    const router = useRouter();
    const { pathname, query } = router;

    useEffect(() => {
        if (!AUTHENTICATE()) return;
    }, []);


    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [query_search, setQuerySearch] = useState("");
    const [type_project_id, setTypeProjectId] = useState("");

    // primara carga
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    useEffect(() => {
        if (query) {
            setQuerySearch(query.query_search);
            setTypeProjectId(query.type_project_id);
        }
    }, [query]);

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

    const handleSearch = () => {
        let { push } = Router;
        query.page = 1;
        query.query_search = query_search;
        query.type_project_id = type_project_id;
        push({ pathname, query });
    }

    // siguiente página
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        query.query_search = query_search;
        query.type_project_id = type_project_id;
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
                <Form>
                    <div className="row">
                        <Form.Field className="col-md-4">
                            <input type="text" 
                                placeholder="Ingrese el Título/Palabra clave"
                                onChange={({ target }) => setQuerySearch(target.value || "")}
                                value={query_search}
                            />
                        </Form.Field>

                        <Form.Field className="col-md-3">
                            <SelectTypeProject
                                name="type_project_id"
                                value={type_project_id}
                                onChange={(e, obj) => setTypeProjectId(obj.value || "")}
                            />
                        </Form.Field>

                        <Form.Field className="col-md-2">
                            <Button fluid 
                                color="blue"
                                onClick={handleSearch}
                            >
                                <i className="fas fa-search"></i>
                            </Button>
                        </Form.Field>
                    </div>
                </Form>
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

export default IndexProject;