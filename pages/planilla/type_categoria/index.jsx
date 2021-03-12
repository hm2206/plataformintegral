import React, {Component, Fragment, useContext, useState} from 'react';
import {Button, Form} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { pageTypeCategoria } from '../../../storage/actions/typeCategoriaActions';
import { Pagination } from 'semantic-ui-react';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import { handleErrorRequest, unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import BoardSimple from '../../../components/boardSimple'
import { AppContext } from '../../../contexts';

const TypeCategoriaIndex = ({ pathname, query, success, type_categorias }) => {

    // app
    const app_context = useContext(AppContext); 

    // manejar opciones
    const getOption = async (obj, key, index) => {
        let { push } = Router;
        switch (key) {
            case 'coin':
            case 'edit':
            case 'discount':
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

    // next page
    const handlePage = async (e, { activePage }) => {
        let { push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // cambiar estados
    const changedState = async (obj, estado = 1) => {
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar'} el Tip. Categoría "${obj.descripcion}"?`);
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await unujobs.post(`type_categoria/${obj.id}/estado`, { estado })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            Router.push(location.href);
        }).catch(err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
    }

    // crear cronograma
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

    // renerizar
    return (
        <div className="col-md-12">
            <BoardSimple
                title="Tip. Categoría"
                info={["Listado del tipo de categoría"]}
                prefix="C"
                bg="danger"
                options={[]}
            >
                <Form className="card-body">
                    <Datatable
                        isFilter={false}
                        headers={["#ID", "Descripción", "Dedicación", "Estado"]}
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
                                    key: "dedicacion",
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
                                    key: "edit",
                                    icon: "fas fa-pencil-alt",
                                    title: "Editar Tip. Categoría",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, 
                                {
                                    key: "coin",
                                    icon: "fas fa-coins",
                                    title: "Config Monto de Tip. Categoría",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                },
                                {
                                    key: "discount",
                                    icon: "fas fa-tags",
                                    title: "Config Descuento del Tip. Categoría",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                },
                                {
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Tip. Categoría",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                }, 
                                {
                                    key: "delete",
                                    icon: "fas fa-times",
                                    title: "Eliminar Tip. Categoría",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={getOption}
                        data={type_categorias.data || []}
                    />
                            
                        <div className="text-center">
                            <hr/>
                            <Pagination activePage={query.page || 1} 
                                totalPages={type_categorias.last_page || 1}
                                onPageChange={handlePage}
                            />
                        </div>
                    </Form>
            </BoardSimple>

            <BtnFloat onClick={handleCreate}>
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </div>
    )
}

// server
TypeCategoriaIndex.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.estado = typeof query.estado != 'undefined' ? query.estado : 1;
    query.year = typeof query.year != 'undefined' ? query.year : new Date().getFullYear();
    // request
    let query_string = `page=${query.page}&estado=${query.estado}&year=${query.year}`;
    let { success, type_categorias } = await unujobs.get(`type_categoria?${query_string}`, {}, ctx)
        .then(res => res.data)
        .catch(err =>  ({ success: false, type_categorias: {} }));
    // response
    return { pathname, query, success, type_categorias };
}

// exportar
export default TypeCategoriaIndex;