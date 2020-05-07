import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'


export default class CreateTypeRemuneracion extends Component
{

    static getInitialProps = (ctx) => {
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        form: { 
            base: "0",
            bonificacion: "0"
        }
    }

    render() {

        let { pathname, query } = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Tip. Remuneración
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">ID-MANUAL</label>
                                            <input type="text"/>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Descripción</label>
                                            <input type="text"/>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Alias</label>
                                            <input type="text"/>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Ext Presupuestal</label>
                                            <input type="text"/>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">¿Aplica a la Base Imponible?</label>
                                            <Select
                                                placeholder="Select. Condición"
                                                options={[
                                                    { key: "base", value: "0", text: "Si" },
                                                    { key: "no-base", value: "1", text: "No" }
                                                ]}
                                                value={this.state.form.base}
                                                name="base"
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">¿Es una Bonificación/Gratificación?</label>
                                            <Select
                                                placeholder="Select. Bonificación/Gratificación"
                                                options={[
                                                    { key: "bonif", value: "1", text: "Si" },
                                                    { key: "no-bonif", value: "0", text: "No" }
                                                ]}
                                                value={this.state.form.bonificacion}
                                                name="bonificacion"
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                    </div>

                                    <div className="col-md-2">
                                        <Button color="teal" fluid>
                                            <i className="fas fa-save"></i> Guardar
                                        </Button>
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