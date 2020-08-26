import React, { Component } from 'react';
import Datatable from '../../components/datatable';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react';
import Show from '../../components/show';
import { Body, Cardinfo } from '../../components/Utils';
import { authentication } from '../../services/apis';
import Swal from 'sweetalert2';
import ModalTracking from '../../components/tramite/modalTracking';
import ModalNextTracking from '../../components/tramite/modalNextTracking';
import ModalSend from '../../components/tramite/modalSend';


export default class TableTracking extends Component {

    state = {
        block: false,
        send: true,
        my_dependencias: [],
        option: {
            key: "",
            tracking: {}
        },
        form: {
            dependencia_id: "",
            status: ""
        }
    }

    componentDidMount = async () => {
        this.props.fireEntity({ render: true });
        this.props.fireLoading(true);
        await this.getMyDependencias(this.props.entity_id, 1, false);
        this.setting(this.props);
        this.props.fireLoading(false);
    }

    componentWillReceiveProps = (nextProps) => {
        let { entity_id } = this.props;
        if (entity_id != nextProps.entity_id) this.getMyDependencias(nextProps.entity_id, 1, false);
    }

    findDependenciaDefault = async (my_dependencias) => {
        let { query } = this.props;
        if (!query.dependencia_id) {
            if (my_dependencias.length) {
                let dep = my_dependencias[0];
                await this.handleInput({ name: 'dependencia_id', value: dep.value });
                await this.handleSearch();
            }
        }
        // habilitar send
        this.setState({ send: true });  
    }

    getMyDependencias = async (id, page = 1, up = true) => {
        if (id) {
            await authentication.get(`auth/dependencia/${id}?page=${page}`)
            .then(async res => {
                let { success, message, dependencia } = res.data;
                if (!success) throw new Error(message);
                let { lastPage, data } = dependencia;
                let newData = [];
                // add data
                await data.map(async d => await newData.push({
                    key: `my_dependencia-${d.id}`,
                    value: `${d.id}`,
                    text: `${d.nombre}`
                }));
                // setting data
                await this.setState(state => ({
                    my_dependencias: up ? [...state.my_dependencias, ...newData] : newData
                }));
                // obtener la primara dependencia
                let { my_dependencias } = this.state;
                this.findDependenciaDefault(my_dependencias);
                // validar request
                if (lastPage >= page + 1) await this.getMyDependencias(page + 1);
            })
            .catch(err => console.log(err.message));
        } else {
            this.setState({ my_dependencias: [] });
            this.handleInput({ name: 'dependencia_id', value: "" })
        }
    }

    setting = () => {
        this.setState((state, props) => {
            state.form.dependencia_id = props.query && props.query.dependencia_id || "";
            state.form.status = props.query && props.query.status || "PENDIENTE";
            return { form: state.form };
        })
    }

    handleInput = ({ name, value }) => {
        this.setState(state => {
            state.form[name] = value;
            return { form: state.form }
        });
    }

    handleSearch = () => {
        let { push, pathname, query } = Router;
        let { status, dependencia_id } = this.state.form;
        // validar send
        if (query.dependencia_id != dependencia_id) this.setState({ send: true });
        query.status = status;
        query.dependencia_id = dependencia_id;
        push({ pathname, query });
    }

    getOption = (obj, key, index) => {
        this.setState(state => {
            state.option.key = key;
            state.option.tracking = obj;
            return { option: state.option };
        });
    }

    render() {

        let { pathname, tracking, titulo, status_count } = this.props;
        let { form, my_dependencias, option, send } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <Datatable titulo={titulo}
                        isFilter={false}
                        headers={ ["N° Seguimiento", "N° Documento", "Tip. Trámite", "N° Documento Remitente", "origen", "Estado"]}
                        index={
                            [
                                {
                                    key: "slug",
                                    type: "icon",
                                    bg: 'dark'
                                }, 
                                {
                                    key: "document_number",
                                    type: "icon",
                                    bg: 'dark'
                                }, 
                                {
                                    key: "description",
                                    type: "icon",
                                    bg: 'dark'
                                }, 
                                {
                                    key: "person.fullname",
                                    type: "text"
                                },
                                {
                                    key: "dependencia_origen.nombre",
                                    type: "icon"
                                },
                                {
                                    key: "status",
                                    type: "option",
                                    data: [
                                        { key: "REGISTRADO" },
                                        { key: "PENDIENTE", className: 'badge-warning' },
                                        { key: "DERIVADO", className: "badge-purple" },
                                        { key: "FINALIZADO", className: "badge-dark" },
                                        { key: "ANULADO", className: "badge-red" }
                                    ]
                                }
                            ]
                        }
                        options={
                            [
                                {
                                    key: "TRACKING",
                                    icon: "fas fa-search",
                                    title: "Seguimiento del Tramite"
                                }, 
                                {
                                    key: "info",
                                    icon: "fas fa-info",
                                    title: "Más información"
                                },
                                {
                                    key: "NEXT",
                                    icon: "fas fa-arrow-right",
                                    title: "Continuar Trámite",
                                    rules: {
                                        key: "status",
                                        value: "REGISTRADO"
                                    }
                                },
                                {
                                    key: "NEXT",
                                    icon: "fas fa-arrow-right",
                                    title: "Continuar Trámite",
                                    rules: {
                                        key: "status",
                                        value: "PENDIENTE"
                                    }
                                }
                            ]
                        }
                        getOption={this.getOption}
                        data={tracking && tracking.data || []}>
                        
                        <div className="mt-3">
                            <div className="row">
                                <div className="col-md-3 col-sm-6">
                                    <Cardinfo
                                        titulo="N° De Documentos"
                                        count={status_count && status_count.data && status_count.data.REGISTRADO}
                                        description="Documentos registrados"
                                    />
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <Cardinfo
                                        style={{ background: "#ffca28" }}
                                        titulo="N° De Documentos"
                                        count={status_count && status_count.data && status_count.data.PENDIENTE}
                                        description="Documentos pendientes"
                                    />
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <Cardinfo
                                        style={{ background: "#673ab7", color: "#fff" }}
                                        titulo="N° De Documentos"
                                        count={status_count && status_count.data && status_count.data.DERIVADO}
                                        description="Documentos derivados"
                                    />
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <Cardinfo
                                        style={{ background: "#d32f2f", color: "#fff" }}
                                        titulo="N° De Documentos"
                                        count={status_count && status_count.data && status_count.data.ANULADO}
                                        description="Documentos anulados"
                                    />
                                </div>
                            </div>

                            <hr/>
                        </div>

                        <Form className="mb-3">
                            <div className="row">
                                <div className="col-md-5 mb-1 col-12 col-sm-6 col-xl-4">
                                    <Form.Field>
                                        <Select
                                            options={my_dependencias}
                                            placeholder="Select. Dependencia" 
                                            name="dependencia_id"
                                            value={`${form.dependencia_id}` || ""}
                                            disabled={this.props.isLoading}
                                            onChange={(e, obj) => this.handleInput(obj)}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-4 mb-1 col-12 col-sm-6 col-xl-2">
                                    <Form.Field>
                                        <Select
                                            options={[
                                                {key: 'REGISTRADO', value: "REGISTRADO", text: "REGISTRADO"},
                                                {key: 'PENDIENTE', value: "PENDIENTE", text: "PENDIENTE"},
                                                {key: 'DERIVADO', value: "DERIVADO", text: "DERIVADO"},
                                                {key: 'ANULADO', value: "ANULADO", text: "ANULADO"}
                                            ]}
                                            placeholder="TODOS" 
                                            name="status"
                                            value={form.status || ""}
                                            disabled={this.props.isLoading}
                                            onChange={(e, obj) => this.handleInput(obj)}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-3 col-12 col-sm-12 col-xl-2 mb-1">
                                    <Button 
                                        fluid
                                        onClick={this.handleSearch}
                                        disabled={this.props.isLoading}
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
                </Body>
                {/* options tracking */}
                <Show condicion={option.key == 'TRACKING'}>
                    <ModalTracking tramite={option.tracking}
                        isClose={(e) => this.getOption({}, "")}
                    />
                </Show>
                {/* tramites enviados */}
                <Show condicion={send && status_count.data && status_count.data.ENVIADO}>
                    <ModalSend onAction={this.getOption} {...this.props} isClose={(e) => this.setState({ send: false })}/>
                </Show>
                {/* options next */}
                <Show condicion={option.key == 'NEXT'}>
                    <ModalNextTracking tramite={option.tracking}
                        isClose={(e) => this.getOption({}, "")}
                    />
                </Show>
            </div>
        )
    }

}
