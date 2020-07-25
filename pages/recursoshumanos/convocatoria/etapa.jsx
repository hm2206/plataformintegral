import React, { Component } from 'react';
import { findConvocatoria, getId } from '../../../services/requests';
import { Body, BtnBack } from '../../../components/Utils'
import { Form, Button, Icon, Select, List, Image } from 'semantic-ui-react'
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { recursoshumanos } from '../../../services/apis';
import Show from '../../../components/show';


export default class EtapaConvocatoria extends Component
{

    static getInitialProps = async (ctx) => {
        let { query, pathname } = ctx;
        let { success, convocatoria } = await findConvocatoria(ctx);
        let _id = getId(ctx);
        return { query, pathname, success, convocatoria, _id };
    }

    state = {
        loading: false,
        staff_id: "",
        estado: "CURRICULAR",
        staff: [],
        etapa: {
            total: 0,
            page: 1,
            lastPage: 1,
            data: []
        }
    }

    componentDidMount = async () => {
        let { convocatoria, success } = this.props;
        if (success) {
            this.props.fireEntity({ render: true, disabled: true, entity_id: convocatoria.entity_id });
            this.setState({ loading: true });
            await this.getStaff();
            this.setState({ loading: false });
        }
    }

    handleSelect = ({ name, value }) => {
        this.setState({ [name]: value, etapa: {
            total: 0,
            page: 1,
            lastPage: 1,
            data: []
        } });
    }

    getStaff = async () => {
        let { _id } = this.props;
        await recursoshumanos.get(`convocatoria/${_id}/staff_requirements`)
        .then(({ data }) => this.setState({ staff: data.success ? data.staff : [] }))
        .catch(err => console.log(err.message));
    }

    getEtapas = async (changed = false) => {
        let { staff_id, estado } = this.state;
        await recursoshumanos.get(`staff_requirement/${staff_id}/etapa?estado=${estado}`)
        .then(res => {
            let { etapa, success, message } = res.data;
            if (!success) throw new Error(message);
            // setting
            this.setState(state => {
                state.etapa.total = etapa.total;
                state.etapa.lastPage = etapa.lastPage;
                state.etapa.page = etapa.page;
                state.etapa.data = changed ? etapa.data : [...state.etapa.data, ...etapa.data]; 
                return { etapa: state.etapa };
            });
        }).catch(err => console.log(err.message))
    }

    handleBack = () => {
        let { push, pathname } = Router;
        push({ pathname: backUrl(pathname) });
    }

    handleCancel = () => {

    }

    render() {

        let { convocatoria, success, isLoading } = this.props;
        let { staff, staff_id, estado, etapa } = this.state;

        return (
            <div className="col-md-12">
            <Body>                    
                <div className="card- mt-3">
                    <div className="card-header">
                    <BtnBack
                        onClick={this.handleBack}
                    /> Etapas de Convocatoria
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center" action="#" onSubmit={(e) => e.preventDefault()}>
                            <div className="col-md-10">
                                <div className="row justify-content-center">
                                    <Form.Field className="col-md-6">
                                        <label htmlFor="" className="text-left">N° de Convocatoria</label>
                                        <input type="text"
                                            name="numero_de_convocatoria"
                                            placeholder="Ingrese el N° de Convocatoria. Ejm: ENTIDAD-001"
                                            value={convocatoria.numero_de_convocatoria}
                                            onChange={(e) => this.handleInput(e.target)}
                                            disabled
                                        />
                                    </Form.Field>

                                    <Form.Field className="col-md-6">
                                        <label>Estado</label>
                                        <input type="text" 
                                            value={convocatoria.estado}
                                            name="estado_actual"
                                            onChange={(e) => this.handleInput(e.target)}
                                            disabled
                                        />
                                    </Form.Field>
                                </div>
                            </div>

                            {/* Cronograma de actividades */}

                            <div className="col-md-10">
                                <hr/>
                                <i className="fas fa-layer-group"></i> Etapas
                                <hr/>
                            </div>

                            <div className="col-md-5">
                                <Select
                                    fluid
                                    options={parseOptions(staff, ["select-staff", "", "Select. R. Personal"], ["id", "id", "slug"])}
                                    placeholder="Select. ID"
                                    name="staff_id"
                                    value={staff_id}
                                    onChange={(e, obj) => this.handleSelect(obj)}
                                />
                            </div>

                            <div className="col-md-3">
                                <Select
                                    fluid
                                    options={[
                                        { key: "CURRICULAR", value: "CURRICULAR", text: "CURRICULAR" },
                                        { key: "CONOCIMIENTO", value: "CONOCIMIENTO", text: "CONOCIMIENTO" },
                                        { key: "ENTREVISTA", value: "ENTREVISTA", text: "ENTREVISTA" },
                                        { key: "GANADOR", value: "GANADOR", text: "GANADOR" }
                                    ]}
                                    placeholder="Select. estado"
                                    name="estado"
                                    value={estado}
                                    onChange={(e, obj) => this.handleSelect(obj)}
                                />
                            </div>

                            <div className="col-md-2">
                                <Button
                                    fluid
                                    color="blue"
                                    onClick={this.getEtapas}
                                    disabled={!staff_id || !estado}
                                >
                                    <i className="fas fa-search"></i>
                                </Button>
                            </div>

                            <Show condicion={etapa.total}>
                                <div className="col-md-10 mt-3">
                                    <hr/>
                                    <div className="card">
                                        <div className="card-header">
                                            <div className="row">
                                                <div className="col-md-10">
                                                    <i className="fas fa-clock"></i> Etapa 
                                                    <i className="fas fa-arrow-right ml-2"></i> 
                                                    <span className="badge badge-warning ml-2">{estado}</span>
                                                </div>
                                                <div className="col-md-2">
                                                    <Show condicion={etapa.total}>
                                                        <a href="#" target="__blank" className="text-dark">
                                                            <i className="fas fa-file-pdf text-red"></i> Reporte
                                                        </a>
                                                    </Show>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <List divided verticalAlign='middle'>
                                                {etapa.data.map(obj => 
                                                    <List.Item key={`etapa-${obj.id}`}>
                                                        <List.Content>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <input type="text"
                                                                        placeholder="Apellidos y Nombres"
                                                                        className="uppercase"
                                                                        value={obj.postulante && obj.postulante.nombre_completo || ""}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                                
                                                                <div className="col-md-2">
                                                                    <input type="number"
                                                                        className="text-right"
                                                                        name="puntaje"
                                                                        value={obj.puntaje}
                                                                        placeholder="0"
                                                                    />
                                                                </div>

                                                                <div className="col-md-2">
                                                                    <input type="text"
                                                                        defaultValue="/20"
                                                                        readOnly
                                                                    />
                                                                </div>

                                                                <div className="col-md-2">
                                                                    <Button
                                                                        disabled={!obj.current}
                                                                    >
                                                                        <i className="fas fa-arrow-right"></i>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </List.Content>
                                                    </List.Item>
                                                )}
                                            </List>
                                        </div>
                                    </div>
                                </div>
                            </Show>
                        </Form>
                    </div>
                
                </div>
            </Body>
        </div>
        )
    }

}