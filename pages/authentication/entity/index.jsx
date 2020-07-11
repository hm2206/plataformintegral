import React, {Component, Fragment} from 'react';
import {Button, Form, Pagination} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import {authentication} from '../../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';

export default class EntityIndex extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            loading: false,
            estado: 1,
            query_search: "",
            entity: {
                data: [],
                last_page: 1
            }
        }

        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let {query, pathname} = ctx;
        query.page = query.page || 1;
        query.query_search = query.query_search || "";
        return {query, pathname}
    }

    componentDidMount = async () => {
        await this.setting(this.props.query || {});
        this.getEntities();
    }

    componentWillReceiveProps = (nextProps) => {
        let { query } = this.props;
        this.getEntities();
        // disable loading
        this.setState({ loading: false });
    }

    setting = (query = {}) => {
        this.setState({
            query_search: query.query_search || "",
            page: query.page || 1 
        })
    }
    
    getEntities = async () => {
        this.setState({ loading: true });
        let { query } = this.props;
        await authentication.get(`entity?query_search=${query.query_search || ""}`)
        .then(res => this.setState({ entity: res.data }))
        .catch(err => console.log(err));
        this.setState({ loading: false });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value })
    }

    getOption(obj, key, index) {
        let {pathname, push} = Router;
        let id = btoa(obj.id);
        this.setState({ loading: true });
        switch (key) {
            case 'edit':
                push({ pathname: `${pathname}/${key}`, query: { id } });
                break;
            default:
                break;
        }
        this.setState({ loading: false });
    }

    handleSearch = () => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.page = 1;
        query.query_search = this.state.query_search;
        push({ pathname, query });
    }

    render() {

        let {loading, entity, page} = this.state;

        return (
                <Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Entidades"
                        isFilter={false}
                        loading={loading}
                        headers={
                            ["#ID", "Nombre", "Slug", "Email", "Ruc"]
                        }
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, {
                                    key: "name",
                                    type: "text",
                                    className: "capitalize"
                                }, {
                                    key: "slug",
                                    type: "icon"
                                }, {
                                    key: "email",
                                    type: "text",
                                    bg: "dark",
                                    justify: "left"
                                }, {
                                    key: "ruc",
                                    type: "icon",
                                    bg: "warning",
                                    justify: "left"
                                }
                            ]
                        }
                        options={
                            [
                                {
                                    key: "edit",
                                    icon: "fas fa-pencil-alt",
                                    title: "Editar Entidad",
                                    rules: {
                                        key: "state",
                                        value: 1
                                    }
                                },
                                {
                                    key: "generate",
                                    icon: "fas fa-times",
                                    title: "Desactivar Entidad",
                                    rules: {
                                        key: "state",
                                        value: 0
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={this.getOption}
                        data={entity.data|| []}>
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
                    
                    <div className="text-center">
                        <hr/>
                        <Pagination defaultActivePage={page || 1} 
                            totalPages={entity.last_page || 1}
                            disabled={this.state.loading}
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
