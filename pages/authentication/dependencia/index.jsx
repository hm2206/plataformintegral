import React, { Component } from 'react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import { AUTHENTICATE } from '../../../services/auth';
import { Form, Button, Select, Pagination } from 'semantic-ui-react';
import { BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import { Body } from '../../../components/Utils';
import { recursoshumanos } from '../../../services/apis';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import { getDependencia } from '../../../services/requests/dependencia';


export default class Dependencia extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: false,
            loading: false,
            block: false,
            type: "",
            query_search: ""
        }
    }

    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let date = new Date;
        let {query, pathname} = ctx;
        query.page = query.page || 1;
        query.query_search = query.query_search || "";
        query.type = query.type ? query.type : "";
        // get dependencia
        let { success, dependencia } = await getDependencia(ctx) || {};
        return { query, pathname, dependencia, success }
    }

    componentDidMount = async () => {
        this.props.fireLoading(true);
        await this.setting(this.props);
        this.props.fireLoading(false);
    }

    setting = (props) => {
        this.setState({ 
            type: props.query.type,
            query_search: props.query.query_search,
            loading: false
        })
    }

    handleInput = ({ name, value }) => {
        this.setState({[name]: value});
    }

    handledependencia = async () => {
        let { push, query, pathname } = Router;
        query.query_search = this.state.query_search;
        query.type = this.state.type;
        await push({ pathname, query });
    }

    getOption = async (obj, key, index) => {
        let {push, pathname, query} = Router;
        switch (key) {
            case 'edit':
                let id = btoa(obj.id);
                query =  { id, __ref: key };
                pathname = `${pathname}/${key}`;
                await push({pathname, query});
                break;
            case 'delete':
                let response = await this.changeState(obj.id, key);
                if (response) push({ pathname, query });
                break;
            default:
                break;
        }
    }

    changeState = async (id, estado) => {
        let answer = await Confirm("warning", `¿Deseas ${estado} la dependencia?`);
        if (answer) {
            this.props.fireLoading(true);
            return await recursoshumanos.post(`dependencia/${id}/${estado}`)
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                return true;
            }).catch(async err => {
                this.props.fireLoading(false);
                await Swal.fire({ icon: 'error', text: err.message });
                return false;
            });
        }
    }

    handlePage = async (e, { activePage }) => {
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    render() {

        let {loading} = this.state;
        let {query, pathname, dependencia, success} = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <Datatable titulo="Lista de dependencias"
                        isFilter={false}
                        loading={loading}
                        headers={ ["#ID", "Numero de dependencia", "F. Inicio", "F. Termino", "Estado"]}
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
                                    key: "descripcion",
                                    type: "text"
                                }, 
                                {
                                    key: "type",
                                    type: "icon"
                                },
                                {
                                    key: "state",
                                    type: "switch",
                                    is_true: "Activo",
                                    is_false: "Deshabilitado"
                                }
                            ]
                        }
                        options={
                            [
                                {
                                    key: "edit",
                                    icon: "fas fa-pencil-alt",
                                    title: "Editar"
                                },
                                {
                                    key: "delete",
                                    icon: "fas fa-times",
                                    title: "Deshabilitar"
                                }
                            ]
                        }
                        getOption={this.getOption}
                        data={dependencia && dependencia.data || []}>
                        <Form className="mb-3">
                            <div className="row">
                                <div className="col-md-6 mb-1 col-6 col-sm-6 col-xl-4">
                                    <Form.Field>
                                        <input type="text" 
                                            placeholder="Buscar dependencia" 
                                            name="query_search"
                                            value={this.state.query_search || ""}
                                            onChange={(e) => this.handleInput(e.target)}
                                            disabled={this.state.loading}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-4 mb-1 col-6 col-sm-6 col-xl-2">
                                    <Form.Field>
                                        <Select
                                            fluid
                                            placeholder="TODOS"
                                            name="type"
                                            value={this.state.type}
                                            onChange={(e, obj) => this.handleInput(obj)}
                                            options={[
                                                { key: 'ALL', value: "", text: 'TODOS'},
                                                { key: 'OTRO', value: 'OTRO', text: 'OTRO'},
                                                { key: 'ESCUELA', value: 'ESCUELA', text: 'ESCUELA'},
                                                { key: 'FACULTAD', value: 'FACULTAD', text: 'FACULTAD'},
                                                { key: 'OFICINA', value: 'OFICINA', text: 'OFICINA'},
                                            ]}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-3 col-6 col-sm-12 col-xl-2 mb-1">
                                    <Button 
                                        fluid
                                        onClick={this.handledependencia}
                                        disabled={this.state.loading}
                                        color="blue"
                                    >
                                        <i className="fas fa-search mr-1"></i>
                                        <span>Buscar</span>
                                    </Button>
                                </div>
                            </div>
                            <hr/>
                        </Form>
                    </Datatable>
                    {/* paginacion */}
                    <div className="text-center">
                        <hr/>
                        <Pagination defaultActivePage={dependencia && dependencia.page || 1} 
                            totalPages={dependencia  && dependencia.lastPage || 1}
                            enabled={this.state.loading}
                            onPageChange={this.handlePage}
                        />
                    </div>
                    {/* event create cronograma */}
                    <BtnFloat
                        disabled={this.state.loading}
                        onClick={(e) => {
                            this.setState({ loading: true });
                            Router.push({ pathname: `${pathname}/create`, query:  { clickb: "cronograma" }});
                        }}
                    >
                        <i className="fas fa-plus"></i>
                    </BtnFloat>
                </Body>
            </div>
        )
    }

}
