import React, {Component, Fragment, useContext} from 'react';
import {Button, Form} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { Pagination } from 'semantic-ui-react';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import { handleErrorRequest, unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import BoardSimple from '../../../components/boardSimple';
import { AppContext } from '../../../contexts';

const TypeRemuneracion = ({ pathname, query, success, type_remuneraciones }) => {

    // app
    const app_context = useContext(AppContext);

    // manejar options
    const getOption = async (obj, key, index) => {
        let { push } = Router;
        // verificar
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
    
    // next page
    const handlePage = async (e, { activePage }) => {
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // crear cronograma
    const handleCreate = async () => {
        let { push } = Router;
        let newQuery = {};
        newQuery.href = btoa(`${location.href}`)
        push({ pathname: `${pathname}/create`, query: newQuery });
    }

    // cambio de estado
    const changedState = async (obj, estado = 0) => {
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar'} el Tip Remuneración "${obj.descripcion}"?`)
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await unujobs.post(`type_remuneracion/${obj.id}/estado`, { estado })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            Router.push(location.href);
        }).catch(err => handleErrorRequest(err, null, app_context.setCurrentLoading(false)));
    }

    // renderizar
    return (
        <Form className="col-md-12">
            <BoardSimple
                title="Tip. Remuneraciones"
                info={["Lista de Tip. Remuneraciones"]}
                prefix="R"
                bg="danger"
                options={[]}
            >
                <Datatable
                    isFilter={false}
                    headers={
                        ["#ID", "Descripción", "Ext Presupuestal", "Edición", "Estado"]
                    }
                    index={
                        [
                            {
                                key: "key",
                                type: "text"
                            }, 
                            {
                                key: "descripcion",
                                type: "text"
                            },
                            {
                                key: "ext_pptto",
                                type: "icon",
                                bg: "dark",
                                justify: "center"
                            },
                            {
                                key: "edit",
                                type: "switch",
                                justify: "center",
                                is_true: "Habilitado",
                                is_false: "Deshabilitado",
                                bg_true: "dark"
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
                                title: "Editar Tip. Remuneración",
                                rules: {
                                    key: "estado",
                                    value: 1
                                }
                            }, {
                                id: 1,
                                key: "restore",
                                icon: "fas fa-sync",
                                title: "Restaurar Tip. Remuneración",
                                rules: {
                                    key: "estado",
                                    value: 0
                                }
                            }, {
                                id: 1,
                                key: "delete",
                                icon: "fas fa-times",
                                title: "Desactivar Tip. Remuneración",
                                rules: {
                                    key: "estado",
                                    value: 1
                                }
                            }
                        ]
                    }
                optionAlign="text-center"
                getOption={getOption}
                data={type_remuneraciones.data || []}
            />
                
            <div className="text-center">
                <hr/>
                <Pagination activePage={query.page || 1} 
                    totalPages={type_remuneraciones.last_page || 0}
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
TypeRemuneracion.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    // filters
    let { pathname, query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    // request
    let query_string = `page=${query.page}`;
    let { success, type_remuneraciones } = await unujobs.get(`type_remuneracion?${query_string}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, type_remuneraciones: {} }));
    // response
    return { pathname, query, success, type_remuneraciones };
}

// exportar
export default TypeRemuneracion;