import React, { Component } from 'react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import { AUTHENTICATE } from '../../../services/auth';
import { Form, Button } from 'semantic-ui-react';
import { BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import SendEmail from '../../../components/cronograma/sendEmail';
import Add from '../../../components/cronograma/add';
import Close from '../../../components/cronograma/close';
import Open from '../../../components/cronograma/open';
import Edit from '../../../components/cronograma/edit';
import { allCronograma } from '../../../storage/actions/cronogramaActions';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { Body } from '../../../components/Utils';


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
        this.setting(this.props);
    }

    componentWillReceiveProps(nextProps) {
        let { query } = this.props;
        if (!nextProps.query.create && nextProps.query.create != query.create) {
            this.handleCronograma();
        } else if (!nextProps.query.open && nextProps.query.open != query.open) {
            this.handleCronograma();
        } else if (!nextProps.query.close && nextProps.query.close != query.close) {
            this.handleCronograma();
        } else if (!nextProps.query.edit && nextProps.query.edit != query.edit) {
            this.handleCronograma();
        } else if (query.mes != nextProps.query.mes || query.year != nextProps.query.year) {
            this.setting(nextProps);
        } else {
            this.setState({ loading: false });
        }
    }

    setting = (props) => {
        this.setState({ 
            year: props.query.year,
            mes: props.query.mes,
            loading: false
        })
    }

    handleInput(e) {
        let {name, value} = e.target;
        this.setState({[name]: value});
    }

    handleCronograma = async () => {
        this.setState({ loading: true });
        let { push, query, pathname } = Router;
        query.year = this.state.year;
        query.mes = this.state.mes;
        push({ pathname, query });
    }

    async getOption(obj, key, index) {
        this.setState({ loading: true });
        let {pathname, query} = Router;
        let id = btoa(obj.id);
        query[key] = id;
        // verificar
        if (key == 'info') {
            query = { id, clickb: "Cronograma" };
            pathname = pathname + "/informacion";
        } else if (key == 'remove') {
            query = { id };
            pathname = `${pathname}/remove`;
        } else if (key == 'report') {
            
            query = { id };
            pathname = `${pathname}/report`;
        }
        // execute
        await Router.push({pathname, query});
        this.setState({ loading: false });
    }

    handleExport = async () => {
        this.setState({ loading: true });
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
        this.setState({ loading: false });
    }

    render() {

        let {loading } = this.state;
        let {query, pathname, cronogramas} = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <Datatable titulo="Lista de Planillas x Mes"
                        isFilter={false}
                        loading={loading}
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
                                    type: "switch",
                                    is_true: "En curso",
                                    is_false: "Cerrada"
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
                                    key: "info",
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
                                    title: "Reportes"
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
                                            disabled={this.state.loading}
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
                                            disabled={this.state.loading}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-3 col-6 col-sm-12 col-xl-2 mb-1">
                                    <Button 
                                        fluid
                                        onClick={this.handleCronograma}
                                        disabled={this.state.loading}
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
                                            onClick={this.handleCronograma}
                                            disabled={this.state.loading}
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
                    {/* enviar email */}
                    <Show condicion={query.send_email}>
                        <SendEmail query={query}
                            isClose={(e) => Router.push({ pathname, query: { send_email: "" } })}
                        />
                    </Show>
                    {/* add infos */}
                    <Show condicion={query.add}>
                        <Add query={query}
                            isClose={(e) => Router.push({ pathname, query: { add: "" } })}
                        />
                    </Show>
                    {/* editar cronograma */}
                    <Show condicion={query.edit}>
                        <Edit query={query}
                            isClose={(e) => Router.push({ pathname, query: { edit: "" } })}
                        />
                    </Show>
                    {/* cerrar planilla */}
                    <Show condicion={query.close}>
                        <Close query={query}
                            isClose={(e) => Router.push({ pathname, query: { close: "" } })}
                        />
                    </Show>
                    {/* abrir planilla */}
                    <Show condicion={query.open}>
                        <Open query={query}
                            isClose={(e) => Router.push({ pathname, query: { open: "" } })}
                        />
                    </Show>
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
