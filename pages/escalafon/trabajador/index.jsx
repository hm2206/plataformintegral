import React, { useState } from 'react'
import { BtnFloat } from '../../../components/Utils';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Button, Form, Pagination } from 'semantic-ui-react'
import { escalafon } from '../../../services/apis';
import DataTable from '../../../components/datatable';
import btoa from 'btoa';
import BoardSimple from '../../../components/boardSimple';

const IndexWork = ({ pathname, query, success, works }) => {

    // estados
    const [query_search, setQuerySearch] = useState(query.query_search || "");

    // obtener opciones
    const handleOption = async (obj, key, index) => {
        switch (key) {
            case 'profile':
                let newQuery =  {};
                newQuery.id = btoa(obj.id);
                newQuery.href = btoa(location.href);
                await Router.push({ pathname: `${pathname}/${key}`, query: newQuery });
                break
            default:
                break;
        }
    }

    // realizar búsqueda
    const handleSearch = () => {
        let { push } = Router;
        query.page = 1;
        query.query_search = query_search;
        push({ pathname, query });
    }

    // siguiente página
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // crear trabajador
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

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
                            headers={["#ID", "Imagen", "Apellidos y Nombres", "N° Documento", "N° Cussp"]}
                            data={works?.data || []}
                            index={[
                                { key: "person.id", type: "text" },
                                { key: "person.image_images.image_50x50", type: 'cover' },
                                { key: "person.fullname", type: "text", className: "uppercase" },
                                { key: "person.document_number", type: "icon" },
                                { key: "numero_de_cussp", type: "icon", bg: 'dark' }
                            ]}
                            options={[
                                { key: "profile", icon: "fas fa-info" }
                            ]}
                            getOption={handleOption}
                        >
                            <div className="col-md-12 mt-2">
                                <div className="row">
                                    <div className="col-md-7 mb-1 col-10">
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
                                <h4>Resultados: {works?.data?.length || 0} de {works?.total || 0}</h4>
                            </div>

                        </DataTable>
                        <div className="text-center">
                            <hr/>
                            <Pagination activePage={query.page || 1} 
                                totalPages={works?.lastPage || 0}
                                onPageChange={handlePage}
                            />
                        </div>
                    </div>

                    <BtnFloat onClick={handleCreate}>
                        <i className="fas fa-plus"></i>
                    </BtnFloat>
                </Form>
            </BoardSimple>
        </div>
    )
}

// server
IndexWork.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // filtros
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
    // request
    let { success, works } = await escalafon.get(`works?page=${query.page}&query_search=${query.query_search}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, works: {} }));
    // response
    return { pathname, query, success, works };
}

// exportar
export default IndexWork;