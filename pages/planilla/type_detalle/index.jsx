import React, { Fragment, useContext } from 'react';
import { Form, Pagination} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { Confirm } from '../../../services/utils';
import { handleErrorRequest, unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts';
import BoardSimple from '../../../components/boardSimple';

const TypeDetalle = ({ pathname, query, success, type_detalles }) => {

    // app
    const app_context = useContext(AppContext);

    // obtener options
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

    // realizar búsqueda
    const handleSearch = () => {
        let { pathname, query, push } = Router;
        query.page = 1;
        push({ pathname, query });
    }

    // next page
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // cambio de estado
    const changedState = async (obj, estado = 1) => {
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar'} el Tip. Detalle "${obj.descripcion}"?`);
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await unujobs.post(`type_detalle/${obj.id}/estado`, { estado })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            Router.push(location.href);
        }).catch(err => handleErrorRequest(err,  null, () => app_context.setCurrentLoading(false)));
    }

    // crear detalle
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
                title="Tip. Detalles"
                info={["Lista de Tip. Detalles"]}
                prefix="D"
                bg="danger"
                options={[]}
            >
                <div className="card-body">
                    <Datatable titulo="Lista de Tip. Detalle"
                        isFilter={false}
                        headers={
                            ["#ID", "Descripción", "Tip. Detalle", "Estado"]
                        }
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, 
                                {
                                    key: "descripcion",
                                    type: "text"
                                },
                                {
                                    key: "type_descuento.descripcion",
                                    type: "icon"
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
                                    key: "edit",
                                    icon: "fas fa-pencil-alt",
                                    title: "Editar Tip. Detalle",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, {
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Tip. Detalle",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                }, {
                                    key: "delete",
                                    icon: "fas fa-times",
                                    title: "Eliminar Tip. Detalle",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={getOption}
                        data={type_detalles && type_detalles.data || []}
                    />
                    {/* cambiar pagina */}
                    <div className="text-center">
                        <hr/>
                        <Pagination activePage={query.page || 1} 
                            totalPages={type_detalles.last_page || 1}
                            onPageChange={handlePage}
                        />
                    </div>
                </div>
            </BoardSimple>

            <BtnFloat onClick={handleCreate}>
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </div>
    )
}

// server rending
TypeDetalle.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.estado = typeof query.estado != 'undefined' ? query.estado : 1;
    query.year = typeof query.year != 'undefined' ? query.year : new Date().getFullYear();
    // request
    let query_string = `page=${query.page}&estado=${query.estado}&year=${query.year}`;
    let { success, type_detalles } = await unujobs.get(`type_detalle?${query_string}`, {}, ctx)
        .then(res => res.data)
        .catch(err =>  ({ success: false, type_detalles: {} }));
    // response
    return { pathname, query, success, type_detalles };
}


export default TypeDetalle;
