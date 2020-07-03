import React, {Component, Fragment} from 'react';
import {Button, Form} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { allTypeSindicato } from '../../../storage/actions/typeSindicatoActions';
import { Pagination } from 'semantic-ui-react';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';

export default class TypeRemuneracion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: false,
            loading: false,
            estado: "1"
        }

        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let {query, pathname, store} = ctx;
        query.page = query.page ? query.page : 1;
        await store.dispatch(allTypeSindicato(ctx));
        let { type_sindicatos } = store.getState().type_sindicato;
        return {query, pathname, type_sindicatos}
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({ loading: false });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value })
    }

    getOption = async (obj, key, index) => {
        let {pathname, push} = Router;
        let id = btoa(obj.id);
        this.setState({ loading: true });
        switch (key) {
            case 'edit':
                await push({ pathname: `${pathname}/${key}`, query: { id } });
                break;
            case 'delete':
                await this.changedState(obj, 0);
                break;
            case 'restore':
                await this.changedState(obj, 1);
                break;
            default:
                break;
        }
        this.setState({ loading: false });
    }

    handleSearch = () => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.estado = this.state.estado;
        push({ pathname, query });
    }

    handlePage = async (e, { activePage }) => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
        this.setState({ loading: false });
    }

    changedState = async (obj, estado = 1) => {
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar'} el Tip. Detalle "${obj.nombre}"?`);
        if (answer) {
            this.setState({ loading: true });
            await unujobs.post(`type_sindicato/${obj.id}/estado`, { estado })
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await this.handleSearch();
            }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
            this.setState({ loading: false });
        }
    }

    render() {

        let {loading} = this.state;
        let { type_sindicatos, query } = this.props;

        return (
                <Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Tip. Afiliaciones"
                        isFilter={false}
                        loading={loading}
                        headers={
                            ["#ID", "Descripción", "Tip. Descuento", "Monto", "Porcentaje", "Estado"]
                        }
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, 
                                {
                                    key: "nombre",
                                    type: "text"
                                },
                                {
                                    key: "type_descuento.descripcion",
                                    type: "icon",
                                    bg: "dark",
                                    justify: "center"
                                },
                                {
                                    key: "monto",
                                    type: "text"
                                },
                                {
                                    key: "porcentaje",
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
                                    title: "Editar Tip. Afiliación",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, 
                                {
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Tip. Afiliación",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                }, 
                                {
                                    key: "delete",
                                    icon: "fas fa-times",
                                    title: "Eliminar Tip. Afiliación",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={this.getOption}
                        data={type_sindicatos}
                    />
                </Body>

                <BtnFloat
                    onClick={async (e) => {
                        await this.setState({ loading: true });
                        let { pathname, push } = Router;
                        push({ pathname: `${pathname}/create` });
                    }}
                >
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </Form>
        )
    }

}
