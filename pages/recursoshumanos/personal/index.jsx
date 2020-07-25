import React, { Component } from 'react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import { AUTHENTICATE } from '../../../services/auth';
import { Form, Button, Select, Pagination } from 'semantic-ui-react';
import { BtnFloat, Body } from '../../../components/Utils';
import Show from '../../../components/show';
import { getStaff } from '../../../services/requests';
import { recursoshumanos } from '../../../services/apis';
import Swal from 'sweetalert2';
import { Confirm } from '../../../services/utils';


export default class StaffIndex extends Component {

    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let date = new Date;
        let {query, pathname} = ctx;
        query.year = query.year ? query.year : date.getFullYear();
        query.mes = query.mes ? query.mes : date.getMonth() + 1;
        query.page = query.page || 1;
        query.estado = query.estado ? query.estado : "";
        let { success, staff } = await getStaff(ctx);
        return { query, pathname, success, staff }
    }

    state = {
        page: false,
        loading: true,
        block: false,
        estado: "",
        year: "",
        mes: ""
    }

    componentDidMount = () => {
        this.props.fireEntity({ render: true });
        this.setting(this.props);
    }

    componentWillReceiveProps(nextProps) {
        let { query } = this.props;
        if (query.mes != nextProps.query.mes || query.year != nextProps.query.year) {
            this.setting(nextProps);
        } else {
            this.setState({ loading: false });
        }
    }

    setting = (props) => {
        this.setState({ 
            year: props.query.year,
            mes: props.query.mes,
            estado: props.query.estado,
            loading: false
        })
    }

    handleInput = ({ name, value }) => {
        this.setState({[name]: value});
    }

    handleConvocatoria = async () => {
        this.setState({ loading: true });
        let { push, query, pathname } = Router;
        query.year = this.state.year;
        query.mes = this.state.mes;
        query.estado = this.state.estado;
        push({ pathname, query });
    }

    getOption = async (obj, key, index) => {
        let {push, pathname, query} = Router;
        switch (key) {
            case 'edit':
            case 'report':
                let id = btoa(obj.id);
                query =  { id, __ref: key };
                pathname = `${pathname}/${key}`;
                await push({pathname, query});
                break;
            case 'publicar':
            case 'terminar':
            case 'cancelar':
                let response = await this.changeState(obj.id, key);
                if (response) push({ pathname, query });
                break;
            default:
                break;
        }
    }

    changeState = async (id, estado) => {
        let answer = await Confirm("warning", `¿Deseas ${estado} el requerimiento de personal?`);
        if (answer) {
            this.props.fireLoading(true);
            return await recursoshumanos.post(`staff_requirement/${id}/${estado}`)
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

    render() {

        let {loading } = this.state;
        let {query, pathname, page_personal, staff, success } = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <Datatable titulo="Lista de Requerimientos de Personal"
                        isFilter={false}
                        headers={ ["#ID", "Perfil Laboral", "F. Inicio", "F. Termino", "Estado"]}
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, 
                                {
                                    key: "perfil_laboral",
                                    type: "text"
                                }, 
                                {
                                    key: "fecha_inicio",
                                    type: "date"
                                }, 
                                {
                                    key: "fecha_final",
                                    type: "date"
                                },
                                {
                                    key: "estado",
                                    type: "option",
                                    data: [
                                        { key: "CREADO", className: 'badge-dark text-white'},
                                        { key: "PUBLICADO", className: 'badge-success'},
                                        { key: "CANCELADO", className: 'badge-danger text-white'},
                                        { key: "TERMINADO", className: 'badge-primary text-white'}
                                    ]
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
                                    key: "publicar",
                                    icon: "fas fa-check",
                                    title: "Publicar",
                                    className: "text-success bg-success",
                                    rules: {
                                        key: "estado",
                                        value: "CREADO"
                                    }
                                },
                                {
                                    key: "terminar",
                                    icon: "fas fa-times",
                                    title: "Terminar",
                                    className: "text-red",
                                    rules: {
                                        key: "estado",
                                        value: "PUBLICADO"
                                    }
                                },
                                {
                                    key: "cancelar",
                                    icon: "fas fa-trash",
                                    title: "Cancelar",
                                    className: "text-red",
                                    rules: {
                                        key: "estado",
                                        value: "CREADO"
                                    }
                                },
                                {
                                    key: "report",
                                    icon: "fas fa-file-alt",
                                    title: "Reportes"
                                }
                            ]
                        }
                        getOption={this.getOption}
                        data={staff && staff.data || []}>
                        <Form className="mb-3">
                            <div className="row">
                                <div className="col-md-4 mb-1 col-6 col-sm-6 col-xl-2">
                                    <Form.Field>
                                        <input type="number" 
                                            min="2019" 
                                            placeholder="Año" 
                                            name="year"
                                            value={this.state.year}
                                            disabled={this.state.loading}
                                            onChange={(e) => this.handleInput(e.target)}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-4 mb-1 col-6 col-sm-6 col-xl-2">
                                    <Form.Field>
                                        <input type="number" 
                                            min="1" 
                                            max="12" 
                                            placeholder="Mes" 
                                            name="mes"
                                            value={this.state.mes}
                                            onChange={(e) => this.handleInput(e.target)}
                                            disabled={this.state.loading}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-4 mb-1 col-6 col-sm-6 col-xl-2">
                                    <Form.Field>
                                        <Select
                                            placeholder="TODOS"
                                            name="estado"
                                            value={this.state.estado}
                                            onChange={(e, obj) => this.handleInput(obj)}
                                            options={[
                                                { key: 'ALL', value: "", text: 'TODOS'},
                                                { key: 'CREADO', value: 'CREADO', text: 'CREADOS'},
                                                { key: 'PUBLICADO', value: 'PUBLICADO', text: 'PUBLICADOS'},
                                                { key: 'CANCELADO', value: 'CANCELADO', text: 'CANCELADOS'},
                                                { key: 'TERMINADO', value: 'TERMINADO', text: 'TERMINADOS'},
                                            ]}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-3 col-6 col-sm-12 col-xl-2 mb-1">
                                    <Button 
                                        fluid
                                        onClick={this.handleConvocatoria}
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
                        <Show condicion={staff && staff.data || false}>
                            <hr/>
                            <Pagination defaultActivePage={query.page || 1} 
                                totalPages={staff && staff.lastPage || 1}
                                enabled={this.state.loading}
                                onPageChange={this.handlePage}
                            />
                        </Show>
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
