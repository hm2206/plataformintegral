import React, {Component, Fragment} from 'react';
import {Button, Form} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import {authentication} from '../../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { pageApps } from '../../../storage/actions/appsActions';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';

export default class SystemIndex extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: false,
            loading: false,
            estado: "1",
            query_search: ""
        }

        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let {query, pathname, store} = ctx;
        query.page = query.page || 1;
        query.query_search = query.query_search || "";
        await store.dispatch(pageApps(ctx));
        let { page_apps } = store.getState().apps;
        return {query, pathname, page_apps}
    }

    componentDidMount = () => {
        this.setting(this.props.query || {});
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({ loading: false });
    }

    setting = (query = {}) => {
        this.setState({
            query_search: query.query_search || ""
        })
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value })
    }

    getOption = async (obj, key, index) => {
        let {pathname, query, push} = Router;
        query.id = btoa(obj.id);
        switch (key) {
            case "edit":
                this.setState({ loading: true });
                await push({ pathname: `${pathname}/${key}`, query });
                break;
            case "delete":
                this.changeState(obj, 0);
                break;
            case "restore":
                this.changeState(obj, 1);
                break;
            default:
                break;
        }
    }

    handleSearch = () => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.page = 1;
        query.query_search = this.state.query_search;
        push({ pathname, query });
    }

    changeState = async (obj, condicion = 0) => {
        let answer = await Confirm("warning", `¿Desea ${condicion ? 'restaurar' : 'desactivar'} al aplicación "${obj.name}"?`, `${condicion ? 'Restaurar' : 'Desactivar'}`);
        if (answer) {
            this.setState({ loading: true });
            await authentication.post(`app/${obj.id}/state`, { state: condicion })
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await  Swal.fire({ icon: 'success', text: message });
                let { push, pathname } = Router;
                await push({ pathname });
            }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
            this.setState({ loading: false });
        }
    }

    render() {

        let {loading} = this.state;
        let { page_apps } = this.props;

        return (
                <Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Apps"
                        isFilter={false}
                        loading={loading}
                        headers={
                            ["#ID", "Nombre", "ClientID", "ClientSecret"]
                        }
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, {
                                    key: "name",
                                    type: "text"
                                }, {
                                    key: "client_id",
                                    type: "icon"
                                }, {
                                    key: "client_secret",
                                    type: "icon",
                                    bg: "dark"
                                }
                            ]
                        }
                        options={
                            [
                                {
                                    key: "edit",
                                    icon: "fas fa-pencil-alt",
                                    title: "Editar Aplicación",
                                    rules: {
                                        key: "state",
                                        value: 1
                                    }
                                },
                                {
                                    key: "delete",
                                    icon: "fas fa-times",
                                    title: "Desactivar Aplicación",
                                    rules: {
                                        key: "state",
                                        value: 1
                                    }
                                },
                                {
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Aplicación",
                                    rules: {
                                        key: "state",
                                        value: 0
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={this.getOption}
                        data={page_apps.data || []}>
                        <div className="form-group">
                            <div className="row">

                                <div className="col-md-4 mb-1">
                                    <input type="text"
                                        value={this.state.query_search || ""}
                                        name="query_search"
                                        onChange={(e) => this.handleInput(e.target)}
                                        placeholder="Buscar por: nombre"
                                    />
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
