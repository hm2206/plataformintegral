import React, {Component, Fragment} from 'react';
import {Button, Form, Pagination} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import { authentication } from '../../../services/apis';
import Router from 'next/router';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { pagePermission } from '../../../storage/actions/permissionActions';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';

export default class ConfigNotificationIndex extends Component {

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
        await store.dispatch(pagePermission(ctx));
        let { page_permission } = store.getState().permission
        return {query, pathname, page_permission}
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
        switch (key) {
            case "delete":
                this.destroy(obj);
                break;
            default:
                break;
        }
    }

    destroy = async (obj) => {
        let answer = await Confirm("warning", `¿Deseas Eliminar El Permiso "${obj.module}"?`, "Eliminar")
        if (answer) {
            this.setState({ loading: true });
            await authentication.post(`permission/${obj.id}/delete`)
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await this.handleSearch();
                await this.props.fireRefreshProfile();
            })
            .catch(err => Swal.fire({ icon: 'error', text: err.message }));
            this.setState({ loading: false });
        }
    }

    handleSearch = () => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.page = 1;
        query.query_search = this.state.query_search;
        push({ pathname, query });
    }

    handlePage = async (e, { activePage }) => {
        let { pathname, query, push } = Router;
        query.page = activePage;
        query.query_search = this.state.query_search;
        await push({ pathname, query });
    }

    render() {

        let {loading} = this.state;
        let { page_permission, query } = this.props;

        return (
                <Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Configuración de las Notificationes"
                        isFilter={false}
                        loading={loading}
                        headers={
                            ["#ID", "Sistema", "Modulo", "Usuario", "Username"]
                        }
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, {
                                    key: "system",
                                    type: "text"
                                }, {
                                    key: "module",
                                    type: "icon"
                                }, {
                                    key: "email",
                                    type: "icon",
                                    bg: "dark",
                                    justify: "center"
                                }, {
                                    key: "username",
                                    type: "icon",
                                    bg: "warning",
                                    justify: "center"
                                }
                            ]
                        }
                        options={
                            [
                                {
                                    id: 1,
                                    key: "delete",
                                    icon: "fas fa-trash-alt",
                                    title: "Quitar Permiso"
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={this.getOption}
                        data={page_permission.data || []}>
                        <div className="form-group">
                            <div className="row">

                                <div className="col-md-4 mb-1">
                                    <input type="text"
                                        value={this.state.query_search || ""}
                                        name="query_search"
                                        onChange={(e) => this.handleInput(e.target)}
                                        placeholder="Buscar por: Username o Email"
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
                    <div className="text-center">
                        <hr/>
                        <Pagination defaultActivePage={query.page || 1} 
                            totalPages={page_permission.lastPage || 1}
                            enabled={this.state.loading}
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
