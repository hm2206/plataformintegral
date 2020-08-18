import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import Router from 'next/router';
import { backUrl } from '../../../services/utils';
import { Form, Select, Button } from 'semantic-ui-react';


export default class IndexTramiteInterno extends Component
{

    static getInitialProps = async (ctx) => {
        let { query, pathname } = ctx;
        return { query, pathname }
    } 

    componentDidMount = () => {
        this.props.fireEntity({ render: true });
    }

    render() {
        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Tramite Interno
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-8">
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <Form.Field>
                                            <label htmlFor="">Mi Dependencia <b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Select. Mi Dependencia"
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mt-3">
                                        <Form.Field>
                                            <label htmlFor="">Procedencia del Documento <b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Select. Procedencia del Documento"
                                            />
                                        </Form.Field>
                                    </div>
                                    
                                    <div className="col-md-6 mt-3">
                                        <Form.Field>
                                            <label htmlFor="">Tipo de Tramite<b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Select. Tipo de Tramite"
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mt-3">
                                        <Form.Field>
                                            <label htmlFor="">N° Documento<b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Select. Mi Dependencia"
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mt-3">
                                        <Form.Field>
                                            <label htmlFor="">N° Folio<b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Select. Mi Dependencia"
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mt-3">
                                        <Form.Field>
                                            <label htmlFor="">Adjuntar Documento<b className="text-red">*</b></label>
                                            <Select
                                                placeholder="Select. Mi Dependencia"
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 mt-3">
                                        <Form.Field>
                                            <label htmlFor="">Asunto de Tramite<b className="text-red">*</b></label>
                                            <textarea name="" rows="10"/>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 mt-4">
                                        <hr/>
                                        <div className="text-right">
                                            <Button color="teal">
                                                <i className="fas fa-save"></i> Guardar Tramite
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </Body>
            </div>
        )
    }

}