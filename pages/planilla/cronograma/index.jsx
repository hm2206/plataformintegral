import React, { Component } from 'react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import Reports from '../../../components/cronograma/reports';
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


export default class Cronograma extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: false,
            loading: true
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

    getOption(obj, key, index) {
        let {pathname, query} = Router;
        let id = btoa(obj.id);
        query[key] = id;
        // verificar
        if (key == 'info') {
            this.setState({ loading: true });
            query = { id, clickb: "Cronograma" };
            pathname = pathname + "/informacion";
        }
        // execute
        Router.push({pathname, query});
    }

    render() {

        let {loading } = this.state;
        let {query, pathname, cronogramas} = this.props;

        return (
            <div>
                <Datatable titulo="Lista de Planillas x Mes"
                    isFilter={false}
                    loading={loading}
                    headers={ ["#ID", "Planilla", "Sede", "Estado"]}
                    index={
                        [
                            {
                                key: "id",
                                type: "text"
                            }, {
                                key: "planilla.nombre",
                                type: "text",
                                children: [
                                    {
                                        key: "adicional",
                                        type: "icon",
                                        prefix: "Adicional"
                                    }
                                ]
                            }, {
                                key: "sede.descripcion",
                                type: "text"
                            }, {
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
                                id: 1,
                                key: "edit",
                                icon: "fas fa-pencil-alt",
                                title: "Editar cronograma",
                                rules: {
                                    key: "estado",
                                    value: 1
                                }
                            }, 
                            {
                                id: 1,
                                key: "info",
                                icon: "fas fa-info",
                                title: "Visualizar cronograma detalladamente",
                                rules: {
                                    key: "estado",
                                    value: 1
                                }
                            }, 
                            {
                                id: 1,
                                key: "info",
                                icon: "fas fa-info",
                                title: "Visualizar cronograma detalladamente",
                                rules: {
                                    key: "estado",
                                    value: 0
                                }
                            },
                            {
                                id: 1,
                                key: "add",
                                icon: "fas fa-user-plus",
                                title: "Agregar trabajadores al cronograma",
                                rules: {
                                    key: "estado",
                                    value: 1
                                }
                            }, 
                            {
                                id: 1,
                                key: "open",
                                icon: "fas fa-lock-open",
                                title: "Abrir cronograma",
                                rules: {
                                    key: "estado",
                                    value: 0
                                }
                            }, 
                            {
                                id: 1,
                                key: "close",
                                icon: "fas fa-lock",
                                title: "Cerrar cronograma",
                                rules: {
                                    key: "estado",
                                    value: 1
                                }
                            }, 
                            {
                                id: 1,
                                key: "send_email",
                                icon: "fas fa-paper-plane",
                                title: "Enviar correo",
                                rules: {
                                    key: "estado",
                                    value: 0
                                }
                            }, 
                            {
                                id: 1,
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
                            <div className="col-md-2 mb-1">
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
                            <div className="col-md-2 mb-1">
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
                            <div className="col-md-2">
                                <Button 
                                    onClick={this.handleCronograma}
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
                {/* reportes */}
                <Show condicion={query.report}>
                    <Reports show={true}
                        query={query}
                        pathname={pathname}
                        isClose={(e) => Router.push({ pathname, query: { report: "" }})}
                    />
                </Show>
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
                    onClick={(e) => Router.push({ pathname: `${pathname}/register`, query:  { clickb: "cronograma" }})}
                >
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </div>
        )
    }

}
