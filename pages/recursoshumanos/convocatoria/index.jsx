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


const getConvocatoria = async (ctx) => {
    let { page, year, mes, estado } = ctx.query;
    return await recursoshumanos.get(`convocatoria?page=${page}&year=${year}&mes=${mes}&estado=${estado}`, {}, ctx)
    .then(res => (res.data))
    .catch(err => ({
        success: false,
        code: err.status || 501,
        message: err.message,
        convocatoria: {
            page: 1,
            last_page: 1,
            data: []
        }
    }));
}


export default class Convocatoria extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: false,
            loading: true,
            block: false,
            estado: "",
            year: "",
            mes: ""
        }

        this.handleInput = this.handleInput.bind(this);
        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let date = new Date;
        let {query, pathname} = ctx;
        query.page = query.page || 1;
        query.year = query.year ? query.year : date.getFullYear();
        query.mes = query.mes ? query.mes : date.getMonth() + 1;
        query.estado = query.estado ? query.estado : "";
        // get convocatoria
        let { success, convocatoria } = await getConvocatoria(ctx) || {};
        return { query, pathname, convocatoria, success }
    }

    componentDidMount = async () => {
        this.props.fireEntity({ render: true })
        await this.setting(this.props);
    }

    setting = (props) => {
        this.setState({ 
            year: props.query.year,
            mes: props.query.mes,
            estado: props.query.estado,
            loading: false
        })
    }

    handleInput({ name, value }) {
        this.setState({[name]: value});
    }

    handleConvocatoria = async () => {
        let { push, query, pathname } = Router;
        query.year = this.state.year;
        query.mes = this.state.mes;
        query.estado = this.state.estado;
        await push({ pathname, query });
    }

    getOption = async (obj, key, index) => {
        let {push, pathname, query} = Router;
        switch (key) {
            case 'edit':
            case 'report':
            case 'etapa':
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
        let answer = await Confirm("warning", `¿Deseas ${estado} la convocatoria?`);
        if (answer) {
            this.props.fireLoading(true);
            return await recursoshumanos.post(`convocatoria/${id}/${estado}`)
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

        let {loading} = this.state;
        let {query, pathname, convocatoria, success} = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <Datatable titulo="Lista de Convocatorias"
                        isFilter={false}
                        loading={loading}
                        headers={ ["#ID", "Numero de Convocatoria", "F. Inicio", "F. Termino", "Estado"]}
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, 
                                {
                                    key: "numero_de_convocatoria",
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
                                    key: "etapa",
                                    icon: "fas fa-layer-group",
                                    title: "Etapas"
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
                        data={convocatoria && convocatoria.data || []}>
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
                        <hr/>
                        <Pagination defaultActivePage={success ? convocatoria.page : 1} 
                            totalPages={success ? convocatoria.last_page : 1}
                            enabled={this.state.loading}
                            onPageChange={this.handlePage}
                        />
                    </div>
                    {/* event create cronograma */}
                    <BtnFloat
                        disabled={this.state.loading}
                        onClick={(e) => {
                            this.setState({ loading: true });
                            Router.push({ pathname: `${pathname}/register`, query:  { clickb: "cronograma" }});
                        }}
                    >
                        <i className="fas fa-plus"></i>
                    </BtnFloat>
                </Body>
            </div>
        )
    }

}
