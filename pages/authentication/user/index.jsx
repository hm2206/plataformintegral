import React, { Component, Fragment } from 'react';
import { Button, Form } from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import { authentication } from '../../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import { BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { pageUser } from '../../../storage/actions/userActions';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';

export default class UserIndex extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            loading: false,
            estado: "1",
            query_search: ""
        }

        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let {query, pathname, store} = ctx;
        query.estado = query.estado || 1;
        query.page = query.page || 1;
        await store.dispatch(pageUser(ctx));
        let { page_user } = await store.getState().user;
        return {query, pathname, page_user}
    }

    componentDidMount = async () => {
        await this.setting(this.props);
    }

    componentWillReceiveProps = async (nextProps) => {
        await this.setting(nextProps);
    }

    setting = ({ query }) => {
        this.setState({
            page: query.page || "1",
            loading: false,
            query_search: query.query_search || ""
        });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value })
    }

    getOption =  (obj, key, index) => {
        switch (key) {
            case "delete":
                this.setChangeState(obj, 0);
                break;
            case "restore":
                this.setChangeState(obj, 1);
                break;
            case "block":
                let { push, pathname } = Router;
                let id = btoa(obj.id);
                push({ pathname: `${pathname}/${key}`, query: { id } });
            default:
                break;
        }
    }

    handleSearch = async () => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.estado = this.state.estado;
        query.page = 1;
        query.query_search = this.state.query_search || "";
        await push({ pathname, query });
    }

    setChangeState = async (obj, condicion) => {
        let answer = await Confirm("warning", `¿Deseas ${condicion ? 'restaurar' : 'desactivar'} la Cuenta ${obj.email}?`);
        if (answer) {
            this.setState({ loading: true });
            await authentication.post(`user/${obj.id}/state`, { state: condicion })
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
        let { page_user } = this.props;

        return (
                <Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Usuarios"
                        isFilter={false}
                        loading={loading}
                        headers={
                            ["#ID", "Username", "Email", "F. Creación", "Estado"]
                        }
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, {
                                    key: "username",
                                    type: "text"
                                }, {
                                    key: "email",
                                    type: "icon"
                                }, {
                                    key: "created_at",
                                    type: "date"
                                }, {
                                    key: "state",
                                    type: "switch",
                                    justify: "center",
                                    is_true: "Activo",
                                    is_false: "Inactivo"
                                }
                            ]
                        }
                        options={
                            [
                                {
                                    key: "delete",
                                    icon: "fas fa-times",
                                    title: "Desactivar Cuenta",
                                    rules: {
                                        key: "state",
                                        value: 1
                                    }
                                }, 
                                {
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Cuenta",
                                    rules: {
                                        key: "state",
                                        value: 0
                                    }
                                },
                                {
                                    key: "block",
                                    icon: "fas fa-ban",
                                    title: "Restricciones"
                                },
                                {
                                    key: "audit",
                                    icon: "fas fa-shield-alt",
                                    title: "Auditoría"
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={this.getOption}
                        data={page_user.data || []}>
                        <div className="form-group">
                            <div className="row">

                                <div className="col-md-4 mb-1">
                                    <Form.Field>
                                        <input type="text"
                                            placeholder="Buscar usuario por: Email o Username"
                                            name="query_search"
                                            value={this.state.query_search}
                                            onChange={(e) => this.handleInput(e.target)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-4 mb-1">
                                    <select  name="estado"
                                        value={this.state.estado}
                                        onChange={(e) => this.handleInput(e.target)}
                                    >
                                        <option value="1">Usuarios Activos</option>
                                        <option value="0">Usuarios Inactivo</option>
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
