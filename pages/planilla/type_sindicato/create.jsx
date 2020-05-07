import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'


export default class CreateTypeSindicato extends Component
{

    static getInitialProps = (ctx) => {
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        form: { 
            edit: "1"
        }
    }

    render() {

        let { pathname, query } = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Tip. Afiliación
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Descripción</label>
                                            <input type="text"/>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Monto</label>
                                            <input type="number"/>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Porcentaje</label>
                                            <input type="number"/>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Tip. Descuento</label>
                                            <Select
                                                placeholder="Select. Descuento"
                                                options={[
                                                    { key: "plame", value: "1", text: "Si" },
                                                    { key: "no-plame", value: "0", text: "No" }
                                                ]}
                                                value={this.state.form.plame}
                                                name="base"
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