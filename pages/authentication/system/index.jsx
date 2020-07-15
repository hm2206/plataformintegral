import React, {Component, Fragment} from 'react';
import {Button, Form} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import {authentication} from '../../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { pageSystem } from '../../../storage/actions/systemActions';
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
        await store.dispatch(pageSystem(ctx));
        let { page_system } = store.getState().system;
        return {query, pathname, page_system}
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

    getOption(obj, key, index) {
        let {push, pathname} = Router;
        let id = btoa(obj.id);
        switch (key) {
            case 'generate':
                this.generateToken(obj, index);
                break;
            case 'module':
            case 'edit':
            case 'method':
                push({ pathname: `${pathname}/${key}`, query: { id }});
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

    generateToken = async (obj, index) => {
        let answer = await Confirm("warning", `¿Deseas generar el Token a sistema de ${obj.name}?`);
        if (answer) {
            this.setState({ loading: true });
            await authentication.post(`system/${obj.id}/generate_token`)
            .then(res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                this.handleSearch();
            }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
            this.setState({ loading: false });
        }
    }

    render() {

        let {loading} = this.state;
        let { page_system } = this.props;

        return (
                <Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Sistemas Integrados"
                        isFilter={false}
                        loading={loading}
                        headers={
                            ["#ID", "Nombre", "Email", "Token", "Versión"]
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
                                    key: "email",
                                    type: "icon"
                                }, {
                                    key: "token",
                                    type: "icon",
                                    bg: "dark",
                                    justify: "center"
                                }, {
                                    key: "version",
                                    type: "icon",
                                    bg: "warning",
                                    justify: "center"
                                }
                            ]
                        }
                        options={
                            [
                                {
                                    key: "edit",
                                    icon: "fas fa-pencil-alt",
                                    title: "Editar Sistema",
                                    rules: {
                                        key: "token"
                                    }
                                },
                                {
                                    key: "module",
                                    icon: "fas fa-list",
                                    title: "Modulo Sistema",
                                },
                                {
                                    key: "method",
                                    icon: "fas fa-wrench",
                                    title: "Metodo de Sistema",
                                },
                                {
                                    key: "generate",
                                    icon: "fas fa-sync",
                                    title: "Generar Token",
                                    rules: {
                                        key: "token"
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={this.getOption}
                        data={page_system.data || []}>
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
