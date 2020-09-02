import React, {Component, Fragment} from 'react';
import {Button, Form, Select} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { Pagination } from 'semantic-ui-react';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import { tramite } from '../../../services/apis';
import Swal from 'sweetalert2';
import { getTramiteType } from '../../../services/requests/tramite';

export default class TypeDescuento extends Component {

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
        query.estado = query.estado || 1;
        let { tramite_type, success } = await getTramiteType(ctx);
        return {query, pathname,  tramite_type, success }
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
                await push({ pathname: `${pathname}/${key}`, query: {id} });
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
        query.state = this.state.estado;
        push({ pathname, query });
    }

    handlePage = async (e, { activePage }) => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
        this.setState({ loading: false });
    }

    changedState = async (obj, state = 1) => {
        let answer = await Confirm("warning", `¿Deseas ${state ? 'restaurar' : 'desactivar'} el Tip. Trámite "${obj.description}"?`);
        if (answer) {
            this.setState({ loading: true });
            await tramite.post(`tramite_type/${obj.id}/state`, { state })
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
        let { tramite_type, success, query } = this.props;

        return (
                <Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Tip. Descuentos"
                        isFilter={false}
                        loading={loading}
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
                        getOption={this.getOption}
                        data={tramite_type.data}
                    >
                        <div className="form-group">
                            <div className="row">

                                <div className="col-md-4 mb-1">
                                    <select  name="estado"
                                        value={this.state.estado}
                                        onChange={(e) => this.handleInput(e.target)}
                                    >
                                        <option value="1">Tip. Descuentos Activos</option>
                                        <option value="0">Tip. Descuentos Deshabilitado</option>
                                    </select>
                                </div>

                                <div className="col-md-2">
                                    <Button onClick={this.handleSearch}
                                        disabled={this.state.loading}
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
                        <Pagination defaultActivePage={query.page} 
                            totalPages={tramite_type.last_page || 1}
                            enabled={loading}
                            activePage={query.page || 1}
                            onPageChange={this.handlePage}
                        />
                    </div>
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
