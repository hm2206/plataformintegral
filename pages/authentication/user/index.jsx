import React, { Component, Fragment, useContext, useState, useEffect } from 'react';
import { Button, Form, Pagination, Select } from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import { authentication, handleErrorRequest } from '../../../services/apis';
import Router, { useRouter } from 'next/router';
import btoa from 'btoa';
import { BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, VERIFY } from '../../../services/auth';
import { pageUser } from '../../../storage/actions/userActions';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import BoardSimple from '../../../components/boardSimple';
import { AppContext } from '../../../contexts/AppContext';
import { system_store } from '../../../services/verify.json';

const UserIndex = ({ users }) => {
    const router = useRouter();
    const { pathname, query } = router;

    useEffect(() => {
        if (!AUTHENTICATE()) return;
    }, []);


    // app
    const app_context = useContext(AppContext);

    // estados
    const [estado, setEstado] = useState(query.estado || 1);
    const [query_search, setQuerySearch] = useState(query.query_search || "");

    // obtener opciones
    const getOption = async (obj, key, index) => {
        switch (key) {
            case "delete":
                setChangeState(obj, 0);
                break;
            case "restore":
                setChangeState(obj, 1);
                break;
            case "block":
            case "config":
                let newQuery =  {};
                newQuery.id = btoa(obj.id);
                newQuery.href = btoa(location.href);
                await Router.push({ pathname: `${pathname}/${key}`, query: newQuery });
            default:
                break;
        }
    }

    // realizar búsqueda
    const handleSearch = async () => {
        let { push } = Router;
        query.estado = estado;
        query.page = 1;
        query.query_search = query_search || "";
        await push({ pathname, query });
    }

    // next page
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        query.estado = estado;
        query.query_search = query_search;
        await push({ pathname, query });
    }

    // crear people
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

    // cambio de estado
    const setChangeState = async (obj, condicion) => {
        let answer = await Confirm("warning", `¿Deseas ${condicion ? 'restaurar' : 'desactivar'} la Cuenta ${obj.email}?`);
        if (!answer) return false; 
        app_context.setCurrentLoading(true);
        await authentication.post(`user/${obj.id}/state?_method=PUT`, { state: condicion })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            let { push } = Router;
            push(location.href);
        }).catch(err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
    }

    // render
    return (
        <Form className="col-md-12">
            <BoardSimple
                title="Usuarios"
                info={["Lista de usuarios"]}
                prefix="U"
                bg="danger"
                options={[]}
            >
                <Datatable
                    isFilter={false}
                    headers={["#ID", "Apellidos y Nombres", "Email", "F. Creación", "Estado"]}
                    index={[
                        {
                            key: "id",
                            type: "text"
                        }, 
                        {
                            key: "person.fullname",
                            type: "text",
                            className: "uppercase"
                        }, 
                        {
                            key: "email",
                            type: "icon"
                        }, 
                        {
                            key: "created_at",
                            type: "date"
                        }, 
                        {
                            key: "state",
                            type: "switch",
                            justify: "center",
                            is_true: "Activo",
                            is_false: "Inactivo"
                        }
                    ]}
                    options={[
                        {
                            key: "delete",
                            icon: "fas fa-times",
                            title: "Desactivar Cuenta",
                            rules: {
                                key: "state",
                                value: 1
                            }
                        }, 
                        {
                            key: "restore",
                            icon: "fas fa-sync",
                            title: "Restaurar Cuenta",
                            rules: {
                                key: "state",
                                value: 0
                            }
                        },
                        {
                            key: "block",
                            icon: "fas fa-ban",
                            title: "Restricciones"
                        },
                        {
                            key: "config",
                            icon: "fas fa-cog",
                            title: "Configuraciones"
                        }
                    ]}
                    optionAlign="text-center"
                    getOption={getOption}
                    data={users.data || []}
                >
                    <div className="form-group">
                        <div className="row">
                            <div className="col-md-4 mb-1">
                                <Form.Field>
                                    <input type="text"
                                        placeholder="Buscar usuario por: Email o Username"
                                        name="query_search"
                                        value={query_search || ""}
                                        onChange={({ target }) => setQuerySearch(target.value)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-4 mb-1">
                                <Select fluid
                                    placeholder="Seleccionar estado"
                                    name="estado"
                                    value={`${estado}`}
                                    options={[
                                        { key: "ACTIVOS", value: "1", text: "Usuarios Activos" },
                                        { key: "INACTIVOS", value: "0", text: "Usuarios Inactivos" }
                                    ]}
                                    onChange={(e, obj) => setEstado(obj.value)}
                                />
                            </div>

                            <div className="col-md-2">
                                <Button color="blue"
                                    onClick={handleSearch}
                                >
                                    <i className="fas fa-search mr-1"></i>
                                    <span>Buscar</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Datatable>
                {/* paginación */}
                <div className="text-center">
                    <hr/>
                    <Pagination activePage={query.page} 
                        totalPages={users.lastPage || 1}
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

// exportar
export default UserIndex;