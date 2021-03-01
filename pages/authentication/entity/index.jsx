import React, { useState } from 'react';
import {Button, Form, Pagination} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import {authentication} from '../../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import { BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';


const EntityIndex = ({ pathname, query, success, entities }) => {

    // estados
    const [query_search, setQuerySearch] = useState("");

    // obtener opciones
    const getOption = async (obj, key, index) => {
        let { push } = Router;
        switch (key) {
            case 'edit':
                let newQuery =  {};
                newQuery.id = btoa(obj.id);
                newQuery.href = btoa(location.href);
                await push({ pathname: `${pathname}/${key}`, query: newQuery });
                break;
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
        query.query_search = query_search;
        await push({ pathname, query });
    }

    // crear dependencia
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

    // renderizado
    return (
        <Form className="col-md-12">
            <BoardSimple
                title="Entidad"
                prefix="E"
                bg="danger"
                info={["Lista de Entidades"]}
                options={[]}
            >
                <Datatable
                    isFilter={false}
                    headers={
                        ["#ID", "Nombre", "Slug", "Email", "Ruc"]
                    }
                    index={
                        [
                            {
                                key: "id",
                                type: "text"
                            }, 
                            {
                                key: "name",
                                type: "text",
                                className: "capitalize"
                            }, 
                            {
                                key: "slug",
                                type: "icon"
                            }, 
                            {
                                key: "email",
                                type: "text",
                                bg: "dark",
                                justify: "left"
                            }, 
                            {
                                key: "ruc",
                                type: "icon",
                                bg: "warning",
                                justify: "left"
                            }
                        ]
                    }
                    options={[
                        {
                            key: "edit",
                            icon: "fas fa-pencil-alt",
                            title: "Editar Entidad",
                            rules: {
                                key: "state",
                                value: 1
                            }
                        },
                        {
                            key: "generate",
                            icon: "fas fa-times",
                            title: "Desactivar Entidad",
                            rules: {
                                key: "state",
                                value: 0
                            }
                        }
                    ]}
                    optionAlign="text-center"
                    getOption={getOption}
                    data={entities.data|| []}
                >
                    <div className="form-group">
                        <div className="row">

                            <div className="col-md-4 mb-1">
                                <input type="text"
                                    value={query_search || ""}
                                    name="query_search"
                                    onChange={({ target }) => setQuerySearch(target.value)}
                                    placeholder="Buscar por: nombre"
                                />
                            </div>

                            <div className="col-md-2">
                                <Button onClick={handleSearch}
                                    color="blue"
                                >
                                    <i className="fas fa-search mr-1"></i>
                                    <span>Buscar</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Datatable>
                
                <div className="text-center">
                    <hr/>
                    <Pagination activePage={query.page || 1} 
                        totalPages={entities.lastPage || 1}
                        onPageChange={handlePage}
                    />
                </div>
            </BoardSimple>

            <BtnFloat
                onClick={handleCreate}
            >
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </Form>
    )
}

// server
EntityIndex.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // filtros
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
    // request
    let { success, entities } = await authentication.get(`entity?page=${query.page}&query_search=${query.query_search}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, entity: {} }));
    // response
    return { pathname, query, success, entities };
}
    
// exportar
export default EntityIndex;