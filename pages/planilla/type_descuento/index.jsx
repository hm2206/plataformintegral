import React, {Component, Fragment, useState, useContext} from 'react';
import {Button, Form, Select} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { pageTypeDescuento } from '../../../storage/actions/typeDescuentoActions';
import { Pagination } from 'semantic-ui-react';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext';

const TypeDescuento = ({ success, type_descuentos, query }) => {

    // estado
    const [estado, setEstado] = useState(query.estado);

    // app
    const app_context = useContext(AppContext);

    // cambio de opción
    const getOption = async (obj, key, index) => {
        let {pathname, push} = Router;
        let id = btoa(obj.id);
        switch (key) {
            case 'edit':
            case 'config':
                await push({ pathname: `${pathname}/${key}`, query: {id} });
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

    // buscar
    const handleSearch = () => {
        let { pathname, push } = Router;
        query.estado = estado;
        push({ pathname, query });
    }

    // cambio de página
    const handlePage = async (e, { activePage }) => {
        let { pathname, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // cambiar estado
    const changedState = async (obj, estado = 1) => {
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar'} el Tip. Descuento "${obj.descripcion}"?`);
        if (answer) {
            app_context.fireLoading(true);
            await unujobs.post(`type_descuento/${obj.id}/estado`, { estado })
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await handleSearch();
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
        }
    }

    // render
    return (<Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Tip. Descuentos"
                        isFilter={false}
                        headers={
                            ["#ID", "Descripción", "Edición", "Estado"]
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
                                    key: "edit",
                                    icon: "fas fa-pencil-alt",
                                    title: "Editar Tip Descuento",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, 
                                {
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Tip Descuento",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                }, 
                                {
                                    key: "delete",
                                    icon: "fas fa-times",
                                    title: "Desactivar Tip Descuento",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={getOption}
                        data={type_descuentos.data || []}
                    >
                        <div className="form-group">
                            <div className="row">

                                <div className="col-md-4 mb-1">
                                    <select  name="estado"
                                        value={`${estado}`}
                                        onChange={({target}) => setEstado(target.value)}
                                    >
                                        <option value="1">Tip. Descuentos Activos</option>
                                        <option value="0">Tip. Descuentos Deshabilitado</option>
                                    </select>
                                </div>

                                <div className="col-md-2">
                                    <Button 
                                        onClick={handleSearch}
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
                        <Pagination 
                            activePage={query.page || 1}
                            totalPages={type_descuentos.last_page || 1}
                            onPageChange={handlePage}
                        />
                    </div>
                </Body>

                <BtnFloat
                    onClick={async (e) => {
                        let { pathname, push } = Router;
                        push({ pathname: `${pathname}/create` });
                    }}
                >
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </Form>
    )
}

// server rendering
TypeDescuento.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.estado = typeof query.estado != 'undefined' ? query.estado : 1;
    let { success, type_descuentos } = await unujobs.get(`type_descuento?page=${query.page}&estado=${query.estado}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false }));
    // response
    return { query, success, type_descuentos }
}

export default TypeDescuento;