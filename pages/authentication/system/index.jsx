import React, { useState, Fragment, useContext } from 'react';
import { Button, Form, Pagination } from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import { authentication, handleErrorRequest } from '../../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import { BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { system_store } from '../../../services/verify.json';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import BoardSimple from '../../../components/boardSimple';
import { AppContext } from '../../../contexts/AppContext';

const SystemIndex = ({ pathname, query, success, systems }) => {

    // app
    const app_context = useContext(AppContext)

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [query_search, setQuerySearch] = useState(query.query_search || "");

    // manejador de opciones
    const getOption = (obj, key, index) => {
        let { push } = Router;
        switch (key) {
            case 'generate':
                generateToken(obj, index);
                break;
            case 'module':
            case 'edit':
            case 'method':
                let id = btoa(obj.id);
                let href = btoa(location.href);
                let newQuery = { id, href };
                push({ pathname: `${pathname}/${key}`, query: newQuery });
                break;
            default:
                break;
        }
    }

    // buscar 
    const handleSearch = () => {
        let { pathname, query, push } = Router;
        query.page = 1;
        query.query_search = query_search;
        push({ pathname, query });
    }

    // generar nuevo token de sistema
    const generateToken = async (obj, index) => {
        let answer = await Confirm("warning", `¿Deseas generar el Token a sistema de ${obj.name}?`);
        if (!answer) return false; 
        app_context.setCurrentLoading(true);
        await authentication.post(`system/${obj.id}/generate_token`)
        .then(res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            handleSearch();
        }).catch(err => handleErrorRequest(err, null, (error) => app_context.setCurrentLoading(false)));
    }

    // siguiente página
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // manejador de crear
    const handleCreate = () => {
        let path = `${pathname}/create`;
        let { push } = Router;
        let newQuery = { href: btoa(location.href) };
        push({ pathname: path, query: newQuery });
    }

    // renderizar
    return (
        <Form className="col-md-12">
            <BoardSimple
                title="Sistemas"
                info={["Lista de sistemas"]}
                bg="danger"
                prefix={"S"}
                options={[]}
            >
                <Datatable
                    isFilter={false}
                    headers={["#ID", "Nombre", "Email", "Token", "Versión"]}
                    index={[
                        {
                            key: "id",
                            type: "text"
                        }, 
                        {
                            key: "name",
                            type: "text"
                        }, 
                        {
                            key: "email",
                            type: "icon"
                        }, 
                        {
                            key: "token",
                            type: "icon",
                            bg: "dark",
                            justify: "center"
                        }, 
                        {
                            key: "version",
                            type: "icon",
                            bg: "warning",
                            justify: "center"
                        }
                    ]}
                    options={[
                        {
                            key: "edit",
                            icon: "fas fa-pencil-alt",
                            title: "Editar Sistema",
                            rules: {
                                key: "token"
                            }
                        },
                        {
                            key: "module",
                            icon: "fas fa-list",
                            title: "Modulo Sistema",
                        },
                        {
                            key: "method",
                            icon: "fas fa-wrench",
                            title: "Metodo de Sistema",
                        },
                        {
                            key: "generate",
                            icon: "fas fa-sync",
                            title: "Generar Token",
                            rules: {
                                key: "token"
                            }
                        }
                    ]}
                    optionAlign="text-center"
                    getOption={getOption}
                    data={systems.data || []}
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
                                    disabled={current_loading}
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
                    <Pagination activePage={systems && systems.page || 1} 
                        totalPages={systems && systems.lastPage || 1}
                        onPageChange={handlePage}
                    />
                </div>
            </BoardSimple>
            {/* boton flotante */}
            <BtnFloat
                onClick={handleCreate}
            >
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </Form>
    )
}

// server
SystemIndex.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    await VERIFY(ctx, system_store.AUTHENTICATION, pathname);
    // filtros
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
    let query_string = `page=${query.page}&query_search=${query.query_search}`;
    // obtener sistem
    let { success, systems } = await authentication.get(`system?${query_string}`, {}, ctx)
    .then(res =>  res.data)
    .catch(err => ({ success: false, system: {} }));
    // response
    return { pathname, query, success, systems };
}

// exportar
export default SystemIndex;
