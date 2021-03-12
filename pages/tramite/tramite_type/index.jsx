import React, { useContext, useState } from 'react';
import {Button, Form, Select} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { Pagination } from 'semantic-ui-react';
import { Confirm } from '../../../services/utils';
import { handleErrorRequest, tramite } from '../../../services/apis';
import Swal from 'sweetalert2';
import BoardSimple from '../../../components/boardSimple';
import { AppContext } from '../../../contexts/AppContext';

const IndexTypeTramite = ({ pathname, query, success, tramite_type }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [estado, setEstado] = useState(query.state);
    const [query_search, setQuerySearch] = useState(query.query_search || "");

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
            case 'delete':
                await changedState(obj, 0);
                break;
            case 'restore':
                await changedState(obj, 1);
                break;
            default:
                break;
        }
    }

    // crear tipo tramite
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

    // buscar
    const handleSearch = () => {
        let { push } = Router;
        query.page = 1;
        query.state = estado ? 1 : 0;
        query.query_search = query_search;
        push({ pathname, query });
    }

    // change page
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // cambio de estado
    const changedState = async (obj, state = 1) => {
        let answer = await Confirm("warning", `¿Deseas ${state ? 'restaurar' : 'desactivar'} el Tip. Trámite "${obj.description}"?`);
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await tramite.post(`tramite_type/${obj.id}/state?_method=PUT`, { state })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            handleSearch();
        }).catch(err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
    }

    // renderizar
    return (
        <Form className="col-md-12">
            <BoardSimple
                title="Tipo Documento"
                prefix="TD"
                info={["Listar tipo de documento"]}
                options={[]}
                bg="danger"
            >
                <Datatable
                    isFilter={false}
                    headers={
                        ["#ID", "Nombre Corto", "Descripción", "Estado"]
                    }
                    index={
                        [
                            {
                                key: "id",
                                type: "text"
                            }, 
                            {
                                key: "short_name",
                                type: "text"
                            },
                            {
                                key: "description",
                                type: "text"
                            },
                            {
                                key: "state",
                                type: "switch",
                                justify: "center",
                                is_true: "Activo",
                                is_false: "Eliminado"
                            }
                        ]
                    }
                    options={
                        [
                            {
                                id: 1,
                                key: "edit",
                                icon: "fas fa-pencil-alt",
                                title: "Editar Tip Trámite",
                                rules: {
                                    key: "state",
                                    value: 1
                                }
                            }, {
                                id: 1,
                                key: "restore",
                                icon: "fas fa-sync",
                                title: "Restaurar Tip Trámite",
                                rules: {
                                    key: "state",
                                    value: 0
                                }
                            }, {
                                id: 1,
                                key: "delete",
                                icon: "fas fa-times",
                                title: "Desactivar Tip Trámite",
                                rules: {
                                    key: "state",
                                    value: 1
                                }
                            }
                        ]
                    }
                    optionAlign="text-center"
                    getOption={getOption}
                    data={tramite_type.data || []}
                >
                    <div className="form-group">
                        <div className="row">

                            <div className="col-md-4 mb-1">
                                <Select fluid  
                                    name="estado"
                                    value={estado ? true : false}
                                    options={[
                                        { key: "estado-enabled", value: true, text: "Activos" },
                                        { key: "estado-disabled", value: false, text: "Deshabilitados" },
                                    ]}
                                    onChange={(e, obj) => setEstado(obj.value)}
                                />
                            </div>

                            <div className="col-md-2">
                                <Button onClick={handleSearch}
                                    color="blue"
                                >
                                    <i className="fas fa-search mr-1"></i>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Datatable>
                
                <div className="text-center">
                    <hr/>
                    <Pagination activePage={query.page} 
                        totalPages={tramite_type.last_page || 1}
                        activePage={query.page || 1}
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
IndexTypeTramite.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // filtros
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.query_search = typeof query.query_search != 'undefined' ? query.query_search : '';
    query.state = typeof query.state != 'undefined' ? query.state : 1;
    let query_string = `page=${query.page}&state=${query.state}&query_search=${query.query_search}`;
    let { success, tramite_type } = await tramite.get(`tramite_type?${query_string}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success, tramite_type: {} }));
    // response
    return { pathname, query, success, tramite_type }
}

// exportar
export default IndexTypeTramite;
