import React, { useState, useContext } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import { BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { Pagination } from 'semantic-ui-react';
import BoardSimple from '../../../components/boardSimple';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext';

const TypeDescuento = ({ success, type_descuentos, query, pathname }) => {

    // estado
    const [estado, setEstado] = useState(query.estado);

    // app
    const app_context = useContext(AppContext);

    // cambio de opción
    const getOption = async (obj, key, index) => {
        let { push } = Router;
        switch (key) {
            case 'edit':
            case 'config':
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
            app_context.setCurrentLoading(true);
            await unujobs.post(`type_descuento/${obj.id}/estado`, { estado })
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
    
    // crear descuento
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
                title="Tip. Descuentos"
                info={["Lista de Tip. Descuentos"]}
                prefix="D"
                bg="danger"
                options={[]}
            >
                <Datatable
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
                                <Select  
                                    name="estado"
                                    value={`${estado}`}
                                    onChange={(e, obj) => setEstado(obj.value)}
                                    options={[
                                        { key: "activo", value: "1", text: "Activos" },
                                        { key: "desactivo", value: "0", text: "Desactivados" }
                                    ]}
                                />
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

                            <div className="col-12"><hr/></div>
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
            </BoardSimple>

            <BtnFloat
                onClick={handleCreate}
            >
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </Form>
    )
}

// server rendering
TypeDescuento.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.estado = typeof query.estado != 'undefined' ? query.estado : 1;
    let { success, type_descuentos } = await unujobs.get(`type_descuento?page=${query.page}&estado=${query.estado}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false }));
    // response
    return { pathname, query, success, type_descuentos }
}

export default TypeDescuento;