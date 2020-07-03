import React, {Component, Fragment} from 'react';
import {Button, Form} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { allAfp } from '../../../storage/actions/afpActions';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';

export default class Afp extends Component {

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
        await store.dispatch(allAfp(ctx));
        let { afps } = store.getState().afp;
        return {query, pathname, afps}
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
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar'} el Ley Social "${obj.descripcion}"?`);
        if (answer) {
            this.setState({ loading: true });
            await unujobs.post(`afp/${obj.id}/estado`, { estado })
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
        let { afps, query } = this.props;

        return (
                <Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Leyes Sociales"
                        isFilter={false}
                        loading={loading}
                        headers={
                            ["#ID", "Descripcion", "Porcentaje", "Aporte Obligatorio", "Prima Seguro", "Prima Limite", "Privado", "Estado"]
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
                                    key: "porcentaje",
                                    type: "icon",
                                    bg: "dark",
                                    justify: "center"
                                },
                                {
                                    key: "aporte",
                                    type: "icon",
                                    bg: "dark"
                                },
                                {
                                    key: "prima",
                                    type: "icon",
                                    bg: "dark",
                                },
                                {
                                    key: "prima_limite",
                                    type: "icon",
                                    bg: "dark",
                                },
                                {
                                    key: "private",
                                    type: "switch",
                                    justify: "center",
                                    is_true: "AFP",
                                    is_false: "ONP / OTRO",
                                    bg_true: "primary",
                                    bg_false: "dark"
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
                                    title: "Editar Ley Social",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, {
                                    id: 1,
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Ley Social",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                }, {
                                    id: 1,
                                    key: "delete",
                                    icon: "fas fa-times",
                                    title: "Desactivar Ley Social",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={this.getOption}
                        data={afps}
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
