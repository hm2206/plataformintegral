import React, { Component } from 'react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import { AUTHENTICATE } from '../../../services/auth';
import { Form, Button, Select } from 'semantic-ui-react';
import Show from '../../../components/show';
import { Body } from '../../../components/Utils';
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { getTracking } from '../../../services/requests/tramite';
import ModalTracking from '../../../components/tramite/modalTracking';
import ModalNextTracking from '../../../components/tramite/modalNextTracking';


export default class TrackingIndex extends Component {


    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname } = ctx;
        let { success, tracking } = await getTracking(ctx, { headers: { DependenciaId: query.dependencia_id || "" } });
        return {query, pathname, success, tracking };
    }

    state = {
        block: false,
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
                this.setState(state => ({
                    my_dependencias: up ? [...state.my_dependencias, ...newData] : newData
                }));
                // validar request
                if (lastPage > page + 1) await this.getMyDependencias(page + 1);
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
            state.form.status = props.query && props.query.status || "";
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

        let { pathname, tracking } = this.props;
        let { form, my_dependencias, option } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <Datatable titulo="Seguimiento Trámite"
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
                                    type: "icon",
                                    bg: 'warning'
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
                                        value: "PENDIENTE"
                                    }
                                }
                            ]
                        }
                        getOption={this.getOption}
                        data={tracking && tracking.data || []}>
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
                                                {key: 'ALL', value: "", text: "TODOS"},
                                                {key: 'PENDIENTE', value: "PENDIENTE", text: "PENDIENTE"},
                                                {key: 'DERIVADO', value: "DERIVADO", text: "DERIVADO"},
                                                {key: 'ACEPTADO', value: "ACEPTADO", text: "ACEPTADO"},
                                                {key: 'RECHAZADO', value: "RECHAZADO", text: "RECHAZADO"},
                                                {key: 'FINALIZADO', value: "FINALIZADO", text: "FINALIZADO"},
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
