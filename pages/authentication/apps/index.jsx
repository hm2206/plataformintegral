import React, { useState, useContext } from 'react';
import { Button, Form , Pagination } from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import {authentication} from '../../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import { BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { Confirm } from '../../../services/utils';
import { system_store } from '../../../services/verify.json'; 
import Swal from 'sweetalert2';
import BoardSimple from '../../../components/boardSimple';
import { AppContext } from '../../../contexts/AppContext';

const AppIndex = ({ pathname, query, apps }) => {

    // app
    const app_context = useContext(AppContext)

    // estados
    const [form, setForm] = useState(JSON.parse(JSON.stringify(query)));

    // cambiar filtros
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // opciones
    const getOption = async (obj, key, index) => {
        let {pathname, push} = Router;
        let id = btoa(obj.id);
        switch (key) {
            case "edit":
            case "menu":
            case "block":
                let newQuery =  {};
                newQuery.id = btoa(obj.id);
                newQuery.href = btoa(location.href);
                await push({ pathname: `${pathname}/${key}`, query: newQuery });
                break;
            case "delete":
                changeState(obj, 0);
                break;
            case "restore":
                changeState(obj, 1);
                break;
            default:
                break;
        }
    }

    // realizar búsqueda
    const handleSearch = () => {
        let { push } = Router;
        query.page = 1;
        query.query_search = form.query_search;
        push({ pathname, query });
    }

    // siguiente página
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // crear dependencia
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

    // cambiar estado
    const changeState = async (obj, condicion = 0) => {
        let answer = await Confirm("warning", `¿Desea ${condicion ? 'restaurar' : 'desactivar'} al aplicación "${obj.name}"?`, `${condicion ? 'Restaurar' : 'Desactivar'}`);
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await authentication.post(`app/${obj.id}/state?_method=PUT`, { state: condicion })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await  Swal.fire({ icon: 'success', text: message });
            Router.push(location.href);
        }).catch(err => {
            try {
                app_context.setCurrentLoading(false);
                let { data } = err.response;
                if (typeof data != 'object') throw new Error(err.message);
                if (typeof data.errors != 'object') throw new Error(data.message || err.message);
                Swal.fire({ icon: 'warning', text: err.message });
            } catch (error) {
                Swal.fire({ icon: 'error', text: error.message })
            }
        });
    }


    return (
        <Form className="col-md-12">
            <BoardSimple
                title="Aplicaciones"
                info={["Lista de Aplicaciones"]}
                bg="danger"
                prefix={"AP"}
                options={[]}
            >
                <Datatable isFilter={false} 
                    headers={["#ID", "Nombre", "ClientID", "ClientSecret"]}
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
                            key: "client_id",
                            type: "icon"
                        },
                        {
                            key: "client_secret",
                            type: "icon",
                            bg: "dark"
                        }
                    ]}
                    options={[
                        {
                            key: "edit",
                            icon: "fas fa-pencil-alt",
                            title: "Editar Aplicación",
                            rules: {
                                key: "state",
                                value: 1
                            }
                        },
                        {
                            key: "menu",
                            icon: "fas fa-list",
                            title: "Agregar Menus",
                            rules: {
                                key: "state",
                                value: 1
                            }
                        },
                        {
                            key: "block",
                            icon: "fas fa-ban",
                            title: "Restricciones",
                        },
                        {
                            key: "delete",
                            icon: "fas fa-times",
                            title: "Desactivar Aplicación",
                            rules: {
                                key: "state",
                                value: 1
                            }
                        },
                        {
                            key: "restore",
                            icon: "fas fa-sync",
                            title: "Restaurar Aplicación",
                            rules: {
                                key: "state",
                                value: 0
                            }
                        }
                    ]}
                    optionAlign="text-center"
                    getOption={getOption}
                    data={apps.data || []}
                >
                    <div className="form-group">
                        <div className="row">
                            <div className="col-md-4 mb-1">
                                <input type="text"
                                    value={form.query_search || ""}
                                    name="query_search"
                                    onChange={({ target }) => handleInput(target)}
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

                            <div className="col-md-12">
                                <hr/>
                            </div>
                        </div>
                    </div>
                </Datatable>
                {/* paginacion */}
                <div className="text-center">
                    <hr/>
                    <Pagination activePage={apps && apps.page || 1} 
                        totalPages={apps && apps.lastPage || 1}
                        onPageChange={handlePage}
                    />
                </div>
            </BoardSimple>

            <BtnFloat onClick={handleCreate}>
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </Form>
    )
}

// server 
AppIndex.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx; 
    // verificar 
    await VERIFY(ctx, system_store.AUTHENTICATION, pathname);
    query.page = typeof query.page == 'undefined' ? 1 : query.page;
    query.query_search = typeof query.query_search == 'undefined' ? "" : query.query_search;
    let query_string = `page=${query.page}&query_search=${query.query_search}`;
    // listar apps
    let { success, apps } = await authentication.get(`app?${query_string}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, apps: {} }));
    // response
    return { pathname, query, success, apps };
}

// exportar
export default AppIndex;