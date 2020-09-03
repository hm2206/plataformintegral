import React, { Component } from 'react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import { AUTHENTICATE } from '../../../services/auth';
import { Form, Button } from 'semantic-ui-react';
import { BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import { allCronograma } from '../../../storage/actions/cronogramaActions';
import { Body } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';


export default class Cronograma extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: false,
            loading: true,
            block: false
        }

        this.handleInput = this.handleInput.bind(this);
        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let date = new Date;
        let {query, pathname} = ctx;
        query.year = query.year ? query.year : date.getFullYear();
        query.mes = query.mes ? query.mes : date.getMonth() + 1;
        await ctx.store.dispatch(allCronograma(ctx));
        let { cronogramas } = ctx.store.getState().cronograma;
        return {query, pathname, cronogramas }
    }

    componentDidMount = () => {
        this.props.fireEntity({ render: true });
        this.setting(this.props);
    }

    componentWillReceiveProps(nextProps) {
        let { query } = this.props;
        if (query.mes != nextProps.query.mes || query.year != nextProps.query.year) {
            this.setting(nextProps);
        }
    }

    setting = (props) => {
        this.setState({ 
            year: props.query.year,
            mes: props.query.mes
        })
    }

    handleInput(e) {
        let {name, value} = e.target;
        this.setState({[name]: value});
    }

    handleCronograma = async () => {
        let { push, query, pathname } = Router;
        query.year = this.state.year;
        query.mes = this.state.mes;
        await push({ pathname, query });
    }

    async getOption(obj, key, index) {
        let {pathname, query} = Router;
        let id = btoa(obj.id);
        query[key] = id;
        // verificar
        switch (key) {
            case 'informacion':
            case 'add':
            case 'remove':
            case 'report':
            case 'edit':
            case 'send_email':
            case 'edit':
                query = { id };
                pathname = `${pathname}/${key}`;
                // execute
                Router.push({pathname, query});
                break;
            case 'restore':
                await this.restore(obj);
                break;
            default:
                break;
        }
    }

    restore = async (obj) => {
        let answer = await Confirm('warning', `¿Estas Seguro en restaurar le cronograma?`);
        if (answer) {
            this.props.fireLoading(true);
            await unujobs.post(`cronograma/${obj.id}/restore`)
                .then(async res => {
                    this.props.fireLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    obj.estado = 1;
                    await Swal.fire({ icon: 'success', text: message });
                    this.handleCronograma();
                }).catch(err => {
                    this.props.fireLoading(false);
                    Swal.fire({ icon: 'error', text: err.message })
                });
        }
    }

    handleExport = async () => {
        let answer = await Confirm("warning", "¿Deseas exportar los cronogramas a excel?")
        if (answer) {
            this.props.fireLoading(true);
            let { year, mes } = this.props.query;
            await unujobs.fetch(`exports/personal/${year}/${mes}`)
            .then(resdata => resdata.blob())
            .then(blob => {
                let a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `report_${year}_${mes}.xlsx`;
                a.target = "_blank";
                a.click();
            })
            .catch(err => Swal.fire({ icon: 'error', text: err.message }));
            this.props.fireLoading(false);
        }
    }

    render() {

        let {query, pathname, cronogramas} = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <Datatable titulo="Lista de Planillas x Mes"
                        isFilter={false}
                        headers={ ["#ID", "Planilla", "Sede", "F. Creado", "N° Trabajadores", "Estado"]}
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, 
                                {
                                    key: "planilla.nombre",
                                    type: "text",
                                    children: [
                                        {
                                            key: "adicional",
                                            type: "icon",
                                            prefix: "Adicional"
                                        }
                                    ]
                                }, 
                                {
                                    key: "sede.descripcion",
                                    type: "text"
                                }, 
                                {
                                    key: "created_at",
                                    type: "date"
                                },
                                {
                                    key: "historial_count",
                                    type: "icon",
                                    bg: 'dark'
                                },
                                {
                                    key: "estado",
                                    type: "option",
                                    data: [
                                        { key: 1, text: "En Curso", className: "badge-success" },
                                        { key: 0, text: "Cerrada", className: "badge-danger" },
                                        { key: 2, text: "Anulada", className: "badge-red" }
                                    ]
                                }
                            ]
                        }
                        options={
                            [
                                {
                                    key: "edit",
                                    icon: "fas fa-pencil-alt",
                                    title: "Editar cronograma",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, 
                                {
                                    key: "informacion",
                                    icon: "fas fa-info",
                                    title: "Visualizar cronograma detalladamente",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, 
                                {
                                    key: "info",
                                    icon: "fas fa-info",
                                    title: "Visualizar cronograma detalladamente",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                },
                                {
                                    key: "add",
                                    icon: "fas fa-user-plus",
                                    title: "Agregar trabajadores al cronograma",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, 
                                {
                                    key: "remove",
                                    icon: "fas fa-user-minus",
                                    title: "Eliminar trabajadores al cronograma",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, 
                                {
                                    key: "send_email",
                                    icon: "fas fa-paper-plane",
                                    title: "Enviar correo",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                }, 
                                {
                                    key: "report",
                                    icon: "fas fa-file-alt",
                                    title: "Reportes",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                },
                                {
                                    key: "report",
                                    icon: "fas fa-file-alt",
                                    title: "Reportes",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                },
                                {
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Cronograma",
                                    rules: {
                                        key: "estado",
                                        value: 2
                                    }
                                }
                            ]
                        }
                        getOption={this.getOption}
                        data={cronogramas.data}>
                        <Form className="mb-3">
                            <div className="row">
                                <div className="col-md-4 mb-1 col-6 col-sm-6 col-xl-2">
                                    <Form.Field>
                                        <input type="number" 
                                            min="2019" 
                                            placeholder="Año" 
                                            name="year"
                                            value={this.state.year}
                                            disabled={this.props.isLoading}
                                            onChange={this.handleInput}
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
                                            onChange={this.handleInput}
                                            disabled={this.props.isLoading}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-3 col-6 col-sm-12 col-xl-2 mb-1">
                                    <Button 
                                        fluid
                                        onClick={this.handleCronograma}
                                        disabled={this.props.isLoading}
                                        color="blue"
                                    >
                                        <i className="fas fa-search mr-1"></i>
                                        <span>Buscar</span>
                                    </Button>
                                </div>

                                <Show condicion={!this.state.block}>
                                    <div className="col-md-3 col-6 col-sm-12 col-xl-2">
                                        <Button 
                                            fluid
                                            disabled={this.props.isLoading || !cronogramas.total}
                                            color="olive"
                                            onClick={this.handleExport}
                                        >
                                            <i className="fas fa-share mr-1"></i>
                                            <span>Exportar</span>
                                        </Button>
                                    </div>
                                </Show>
                            </div>
                            <hr/>
                        </Form>
                    </Datatable>
                    {/* event create cronograma */}
                    <BtnFloat
                        disabled={this.props.isLoading}
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
