import React, {Component, Fragment} from 'react';
import {Button, Form} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import {authentication} from '../../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { pageApps } from '../../../storage/actions/appsActions';

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

    getOption(obj, key, index) {
        let {pathname, query} = Router;
        query[key] = btoa(obj.id);
        Router.push({pathname, query});
    }

    handleSearch = () => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.page = 1;
        query.query_search = this.state.query_search;
        push({ pathname, query });
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
                                    id: 1,
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Cargo"    
                                }, {
                                    id: 1,
                                    key: "delete",
                                    icon: "fas fa-trash-alt",
                                    title: "Eliminar Cargo",
                                    rules: {
                                        key: "estado",
                                        value: 1
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
