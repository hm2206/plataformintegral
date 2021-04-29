import React, { useContext, useState} from 'react';
import {Button, Form, Select} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import { BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { Pagination } from 'semantic-ui-react';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../../components/boardSimple';


const Meta = ({ pathname, success, metas, query }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [year, setYear] = useState(query.year);
    const [estado, setEstado] = useState("1");

    // optener opciones
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

    // cambiar de estado
    const changedState = async (obj, estado) => {
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar' } la meta "${obj.metaID}"?`)
        if (answer) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`meta/${obj.id}/estado`, { estado })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await handleSearch();
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
        }
    }

    // realizar busqueda
    const handleSearch = () => {
        let { pathname, query, push } = Router;
        query.estado = estado;
        query.year = year;
        push({ pathname, query });
    }

    // aperturar metas desde un año anterior
    const aperturarMetas = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en aperturar las metas desde un año anterior?`)
        if (answer) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`meta/apertura`)
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await handleSearch();
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
        }
    }

    // cambio de página
    const handlePage = async (e, { activePage }) => {
        let { pathname, query, push } = Router;
        query.page = activePage;
        query.year = year;
        query.estado = estado;
        await push({ pathname, query });
    }

    // crear meta
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

    // render 
    return (
        <Form className="col-md-12">
            <BoardSimple
                title="Metas"
                info={["Listado de Metas Presp."]}
                prefix="M"
                bg="danger"
                options={[
                    { key: "apertura", title: "Aperturar metas", icon: "fas fa-arrow-down" }
                ]}
                onOption={aperturarMetas}
            >
                <Datatable
                    isFilter={false}
                    headers={
                        ["#metaID", "Descripción", "#actividadID", "Actividad", "Estado"]
                    }
                    index={
                        [
                            {
                                key: "metaID",
                                type: "text"
                            }, 
                            {
                                key: "meta",
                                type: "text"
                            },
                            {
                                key: "actividadID",
                                type: "text"
                            },
                            {
                                key: "actividad",
                                type: "text"
                            },
                            {
                                key: "estado",
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
                                title: "Editar Meta",
                                rules: {
                                    key: "estado",
                                    value: 1
                                }
                            }, {
                                id: 1,
                                key: "restore",
                                icon: "fas fa-sync",
                                title: "Restaurar Meta",
                                rules: {
                                    key: "estado",
                                    value: 0
                                }
                            }, {
                                id: 1,
                                key: "delete",
                                icon: "fas fa-times",
                                title: "Desactivar Meta",
                                rules: {
                                    key: "estado",
                                    value: 1
                                }
                            }
                        ]
                    }
                    optionAlign="text-center"
                    getOption={getOption}
                    data={metas && metas.data}
                >
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-3 mb-2">
                                <Form.Field>
                                    <input type="number" 
                                        name="year"
                                        value={year}
                                        onChange={({target}) => setYear(target.value)}
                                    />
                                </Form.Field>
                            </div>
                            <div className="col-md-4 mb-2">
                                <Form.Field>
                                    <Select
                                        fluid
                                        options={[
                                            {key: "active", value: "1", text: "Activo"},
                                            {key: "des-active", value: "0", text: "Desactivado"}
                                        ]}
                                        name="estado"
                                        value={`${estado}`}
                                        onChange={(e, obj) => setEstado(obj.value)}
                                    />
                                </Form.Field>
                            </div>
                            <div className="col-md-2 mb-2">
                                <Button fluid
                                    color="blue"
                                    onClick={handleSearch}
                                >
                                    <i className="fas fa-search"></i>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Datatable>
                    
                <div className="text-center">
                    <hr/>
                    <Pagination activePage={query.page} 
                        totalPages={metas.last_page || 1}
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

// server rending
Meta.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.estado = typeof query.estado != 'undefined' ? query.estado : 1;
    query.year = typeof query.year != 'undefined' ? query.year : new Date().getFullYear();
    let { success, metas } = await unujobs.get(`meta?page=${query.page}&estado=${query.estado}&year=${query.year}`, {}, ctx)
        .then(res => res.data)
        .catch(err =>  ({ success: false, metas: {} }));
    // response
    return { pathname, success, metas: metas || {}, query };
}


export default Meta;