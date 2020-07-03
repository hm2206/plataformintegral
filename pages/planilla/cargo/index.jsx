import React, {Component, Fragment} from 'react';
import {Button, Form} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import { unujobs } from '../../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { pageCargo } from '../../../storage/actions/cargoActions';
import Swal from 'sweetalert2';
import { Confirm } from '../../../services/utils';

export default class CargoIndex extends Component {

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
        query.estado = query.estado ? query.estado : 1;
        await store.dispatch(pageCargo(ctx));
        let { page_cargos } = store.getState().cargo;
        return {query, pathname, page_cargos}
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({ loading: false });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value })
    }

    getOption = async (obj, key, index) => {
        this.setState({ loading: true });
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
        // disable option
        this.setState({ loading: false });
    }

    handleSearch = () => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.estado = this.state.estado;
        push({ pathname, query });
    }

    changedState = async (obj, estado = 1) => {
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

    render() {

        let {loading} = this.state;
        let { page_cargos } = this.props;

        return (
                <Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Particiones Presupuestales"
                        isFilter={false}
                        loading={loading}
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
                                }, {
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
                        getOption={this.getOption}
                        data={page_cargos.data}>
                        <div className="form-group">
                            <div className="row">

                                <div className="col-md-4 mb-1">
                                    <select  name="estado"
                                        value={this.state.estado}
                                        onChange={(e) => this.handleInput(e.target)}
                                    >
                                        <option value="1">Cargos Activos</option>
                                        <option value="0">Cargos Deshabilitado</option>
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
