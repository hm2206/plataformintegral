import React, {Component, Fragment} from 'react';
import { Form, Pagination } from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { allTypeAportacion } from '../../../storage/actions/typeAportacionActions';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';

const TypeAportacion = ({ success, type_aportaciones }) => {

    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         page: false,
    //         loading: false,
    //         estado: "1"
    //     }

    //     this.getOption = this.getOption.bind(this);
    // }

    // static getInitialProps = async (ctx) => {
    //     await AUTHENTICATE(ctx);
    //     let {query, pathname, store} = ctx;
    //     await store.dispatch(allTypeAportacion(ctx));
    //     let { type_aportaciones } = store.getState().type_aportacion;
    //     return {query, pathname, type_aportaciones }
    // }

    // componentWillReceiveProps = (nextProps) => {
    //     this.setState({ loading: false });
    // }

    // handleInput = ({ name, value }) => {
    //     this.setState({ [name]: value })
    // }

    // next
    const onChangePage = (e, { activePage }) => {
        let { query, pathname, push } = Router;
        query.page = activePage;
        push({ pathname, query });
    }

    // handleSearch = () => {
    //     this.setState({ loading: true });
    //     let { pathname, query, push } = Router;
    //     query.estado = this.state.estado;
    //     push({ pathname, query });
    // }

    // obtener opciones
    const getOption = async (obj, key, index) => {
        let { pathname, push } = Router;
        let id = btoa(`${obj.id || ""}`);
        switch (key) {
            case 'edit':
                await push({ pathname: `${pathname}/edit`, query: { id } });
                break;
            case 'delete':
                await this.changedState(obj, 0);
                break;
            case 'restore':
                this.changedState(obj, 1);
                break;
            default:
                break;
        }
    }

    // changedState = async (obj, estado = 1) => {
    //     let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar'} el Tip. Aportación "${obj.descripcion}"?`);
    //     if (answer) {
    //         this.setState({ loading: true });
    //         await unujobs.post(`type_aportacion/${obj.id}/estado`, { estado })
    //         .then(async res => {
    //             let { success, message } = res.data;
    //             if (!success) throw new Error(message);
    //             await Swal.fire({ icon: 'success', text: message });
    //             await this.handleSearch();
    //         }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
    //         this.setState({ loading: false });
    //     }
    // }

    return (
    <Form className="col-md-12">
        <Body>
            <Datatable titulo="Lista de Tip. Aportación"
                isFilter={false}
                headers={["#ID", "Descripción", "Exp Pptto", "Porcentaje%", "Minimo", "Predeterminado", "Estado"]}
                index={[
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
                        type: "icon"
                    },
                    {
                        key: "porcentaje",
                        type: "text"
                    },
                    {
                        key: "minimo",
                        type: "text"
                    },
                    {
                        key: "default",
                        type: "text"
                    },
                    {
                        key: "estado",
                        type: "switch",
                        justify: "center",
                        is_true: "Activo",
                        is_false: "Eliminado"
                    }
                ]}
                options={[
                    {
                        key: "edit",
                        icon: "fas fa-pencil-alt",
                        title: "Editar Tip. Aportación",
                        rules: {
                            key: "estado",
                            value: 1
                        }
                        },
                        {
                            key: "restore",
                            icon: "fas fa-sync",
                            title: "Restaurar Tip. Aportación",
                            rules: {
                                key: "estado",
                                value: 0
                            }
                        }, 
                        {
                            key: "delete",
                            icon: "fas fa-times",
                            title: "Deactivar Tip. Aportación",
                            rules: {
                                key: "estado",
                                value: 1
                            }
                        }
                    ]}
                optionAlign="text-center"
                getOption={getOption}
                data={type_aportaciones.data || []}
            />
        </Body>

        <div className="table-responsive text-center">
            <hr/>
            <Pagination 
                totalPages={type_aportaciones.last_page || 1}
                activePage={type_aportaciones.current_page || 1}
                onPageChange={onChangePage}
            />
        </div>

        <BtnFloat
            onClick={async (e) => {
                let { pathname, push } = Router;
                push({ pathname: `${pathname}/create` });
            }}
        >
            <i className="fas fa-plus"></i>
        </BtnFloat>
    </Form>)
}

// server rendering
TypeAportacion.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    let { success, type_aportaciones } = await unujobs.get(`type_aportacion?page=${query.page}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false }))
    // response
    return { success, type_aportaciones: type_aportaciones || {} };
}

// export
export default TypeAportacion;
