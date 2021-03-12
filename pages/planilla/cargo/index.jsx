import React, { useState } from 'react';
import {Button, Form, Select, Pagination} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import { unujobs } from '../../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import Swal from 'sweetalert2';
import { Confirm } from '../../../services/utils';
import BoardSimple from '../../../components/boardSimple';

const CargoIndex = ({ pathname, query, success, cargos }) => {

    const [form, setForm] = useState({ estado: query.estado });

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }
    
    // obtener opciones
    const getOption = async (obj, key, index) => {
        let { pathname, push } = Router;
        let id = btoa(`${obj.id || ""}`);
        switch (key) {
            case 'edit':
            case 'type_categoria':
                await push({ pathname: `${pathname}/edit`, query: { id } });
                break;
            case 'delete':
                await changedState(obj, 0);
                break;
            case 'restore':
                changedState(obj, 1);
                break;
            default:
                break;
        }
    }

    // realizar busqueda
    const handleSearch = () => {
        let { pathname, query, push } = Router;
        query.estado = typeof form.estado != 'undefined' ? form.estado : "";
        push({ pathname, query });
    }

    // cambiar estado
    const changedState = async (obj, estado = 1) => {
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar'} la partición "${obj.descripcion}"?`)
        if (answer) {
            this.setState({ loading: true });
            await unujobs.post(`cargo/${obj.id}/estado`, { estado })
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await this.handleSearch();
            }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
            this.setState({ loading: false });
        }
    }
    
    // next
    const onChangePage = (e, { activePage }) => {
        let { query, pathname, push } = Router;
        query.page = activePage;
        push({ pathname, query });
    }

    // render
    return (
        <div className="col-md-12">
            <BoardSimple
                title="Partición Presupuestal"
                info={["Listar Partición Pres."]}
                prefix="P"
                bg="danger"
                options={[]}
            >
                <Form className="card-body">
                    <Datatable
                        isFilter={false}
                        headers={
                            ["#ID", "Descripcion", "Planilla", "Ext Presupuestal", "Estado"]
                        }
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, {
                                    key: "descripcion",
                                    type: "text"
                                }, {
                                    key: "planilla.nombre",
                                    type: "icon"
                                }, {
                                    key: "ext_pptto",
                                    type: "icon",
                                    bg: "dark",
                                    justify: "center"
                                }, {
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
                                    title: "Editar Partición Presup.",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, 
                                {
                                    key: "type_categoria",
                                    icon: "fas fa-cogs",
                                    title: "Agregar tip. Categorías",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                },
                                {
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Partición Presup.",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                }, {
                                    key: "delete",
                                    icon: "fas fa-times",
                                    title: "Eliminar Partición Presup.",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={getOption}
                        data={cargos.data || []}
                    >
                        <div className="form-group">
                            <div className="row">
                                <div className="col-md-4 mb-1">
                                    <Select  
                                        name="estado"
                                        fluid
                                        placeholder="Todos"
                                        value={`${form.estado || ""}`}
                                        options={[
                                            { key: "ALL", value: "", text: "Todos" },
                                            { key: "ACTIVO", value: "1", text: "Activos" },
                                            { key: "DESACTIVO", value: "0", text: "Desactivos" },
                                        ]}
                                        onChange={(e, obj) => handleInput(obj)}
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
                            </div>
                        </div>
                    </Datatable>
                </Form>
            </BoardSimple>

            <div className="table-responsive text-center">
                <hr/>
                <Pagination 
                    totalPages={cargos.last_page || 1}
                    activePage={cargos.current_page || 1}
                    onPageChange={onChangePage}
                />
            </div>

            <BtnFloat onClick={async (e) => {
                    let { pathname, push } = Router;
                    push({ pathname: `${pathname}/create` });
                }}
            >
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </div>
    )
}

// server rendering
CargoIndex.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.estado = typeof query.estado != 'undefined' ? query.estado : "";
    let { success, cargos } = await unujobs.get(`cargo?page=${query.page}&estado=${query.estado}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, cargos: {} }));
    // response
    return { success, query, cargos: cargos };
}

export default CargoIndex;