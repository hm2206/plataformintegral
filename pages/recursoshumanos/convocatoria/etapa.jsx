import React, { Component } from 'react';
import { findConvocatoria, getId } from '../../../services/requests';
import { Body, BtnBack } from '../../../components/Utils'
import { Form, Button, Icon, Select, List, Image } from 'semantic-ui-react'
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { recursoshumanos } from '../../../services/apis';


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
        staff: []
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

    getStaff = async () => {
        let { _id } = this.props;
        await recursoshumanos.get(`convocatoria/${_id}/staff_requirements`)
        .then(({ data }) => this.setState({ staff: data.success ? data.staff : [] }))
        .catch(err => console.log(err.message));
    }

    getEtapas = () => {
        let { _id } = this.props;
    }

    handleBack = () => {
        let { push, pathname } = Router;
        push({ pathname: backUrl(pathname) });
    }

    handleCancel = () => {

    }

    render() {

        let { convocatoria, success, isLoading } = this.props;
        let { staff } = this.state;

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

                            <div className="col-md-4">
                                <Select
                                    fluid
                                    options={parseOptions(staff, ["select-staff", "", "Select. R. Personal"], ["id", "id", "slug"])}
                                    placeholder="Select. R. Personal"
                                />
                            </div>

                            <div className="col-md-6"></div>

                            <div className="col-md-10 mt-3">
                                <hr/>
                                <div className="card">
                                    <div className="card-header">
                                        <div className="row">
                                            <div className="col-md-10">Nombre de La etapa</div>
                                            <div className="col-md-2">
                                                <a href="#" target="__blank" className="text-dark">
                                                    <i className="fas fa-file-pdf text-red"></i> Reporte
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <List divided verticalAlign='middle'>
                                            <List.Item>
                                                <List.Content>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <input type="text"
                                                                placeholder="Apellidos y Nombres"
                                                                readOnly
                                                            />
                                                        </div>
                                                        
                                                        <div className="col-md-2">
                                                            <input type="number"
                                                                className="text-right"
                                                                name=""placeholder="0"
                                                            />
                                                        </div>

                                                        <div className="col-md-2">
                                                            <input type="text"
                                                                defaultValue="/20"
                                                                readOnly
                                                            />
                                                        </div>

                                                        <div className="col-md-2">
                                                            <Button>
                                                                <i className="fas fa-arrow-right"></i>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </List.Content>
                                            </List.Item>
                                        </List>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                
                </div>
            </Body>
        </div>
        )
    }

}