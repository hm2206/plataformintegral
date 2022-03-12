import React, { useContext, useState, useEffect } from 'react'
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Button, Form, Pagination } from 'semantic-ui-react'
import { microScale } from '../../../services/apis';
import DataTable from '../../../components/datatable';
import btoa from 'btoa';
import BoardSimple from '../../../components/boardSimple';
import { EntityContext } from '../../../contexts/EntityContext'; 
import { ReportRenta } from '../../../components/planilla/work/report-renta';
import Show from '../../../components/show';

const IndexWork = ({ pathname, query, works }) => {

    // estados
    const [query_search, setQuerySearch] = useState(query.querySearch || "");
    const [cargo_id] = useState(query.cargo_id || "");
    const [options, setOptions] = useState("");
    const [currentWork, setCurrentWork] = useState();

    // entity
    const entity_context = useContext(EntityContext)

    // obtener opciones
    const handleOption = async (obj, key, index) => {
        switch (key) {
            case 'profile':
                let newQuery =  {};
                newQuery.id = btoa(obj.id);
                newQuery.href = btoa(location.href);
                await Router.push({ pathname: `${pathname}/${key}`, query: newQuery });
                break
            case 'renta':
                setOptions(key);
                console.log(obj)
                setCurrentWork(obj)
            default:
                break;
        }
    }

    // realizar búsqueda
    const handleSearch = () => {
        let { push } = Router;
        query.page = 1;
        query.querySearch = query_search;
        query.cargo_id = cargo_id;
        push({ pathname, query });
    }

    // siguiente página
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: false });
    }, []);

    // renderizar
    return (
        <div className="col-md-12">
            <BoardSimple
                prefix="T"
                title="Trabajadores"
                info={["Listado de trabajadores"]}
                bg="danger"
                options={[]}
            >
                <Form>
                    <div className="col-md-12">
                        <DataTable
                            headers={["#ID", "Apellidos y Nombres", "N° Documento", "N° Cussp", "Estado"]}
                            data={works?.items || []}
                            index={[
                                { key: "person.id", type: "text" },
                                { key: "person.fullName", type: "text", className: "uppercase" },{ key: "person.documentNumber", type: "icon" },
                                { key: "numberOfCussp", type: "icon", bg: 'dark' },
                                { key: "state", type: "switch", bg_true: "success", bg_false: "danger", is_true: "Activo", is_false: "Inactivo" }
                            ]}
                            options={[
                                { key: "profile", icon: "fas fa-info" },
                                { key: "renta", icon: "fas fa-money-check-alt" }
                            ]}
                            getOption={handleOption}
                        >
                            <div className="col-md-12 mt-2">
                                <div className="row">
                                    <div className="col-md-6 mb-1 col-12">
                                        <Form.Field>
                                            <input type="text" 
                                                placeholder="Buscar trabajador por: Apellidos y Nombres"
                                                name="query_search"
                                                value={query_search || ""}
                                                onChange={({ target }) => setQuerySearch(target.value)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-xs col-2">
                                        <Button color="blue"
                                            fluid
                                            onClick={handleSearch}
                                        >
                                            <i className="fas fa-search"></i>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body mt-4">
                                <h4>Resultados: {works?.items?.length || 0} de {works?.meta?.totalItems || 0}</h4>
                            </div>

                        </DataTable>
                        <div className="text-center">
                            <hr/>
                            <Pagination activePage={query.page || 1} 
                                totalPages={works?.meta?.totalPages || 0}
                                onPageChange={handlePage}
                            />
                        </div>
                    </div>
                </Form>
            </BoardSimple>
            {/* modal renta */}
            <Show condicion={options == "renta"}>
                <ReportRenta
                    work={currentWork}
                    onClose={() => setOptions("")}
                />
            </Show>
        </div>
    )
}

// server
IndexWork.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // filtros
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.querySearch = typeof query.querySearch != 'undefined' ? query.querySearch : "";
    query.cargo_id = typeof query.cargo_id != 'undefined' ? query.cargo_id : "";
    // request
    let { success, works } = await microScale.get(`works?page=${query.page}&querySearch=${query.querySearch}&cargo_id=${query.cargo_id}`, {}, ctx)
    .then(res => ({ success: true, works: res.data }))
    .catch(() => ({ success: false, works: {} }));
    // response
    return { pathname, query, success, works };
}

// exportar
export default IndexWork;