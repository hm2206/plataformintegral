import React, { Component, Fragment } from 'react';
import { Button, Form } from 'semantic-ui-react';

export default class CreateInfo extends Component
{

    render() {
        return (
            <Form>
                <div className="col-md-12">
                    <Button>
                        <i className="fas fa-arrow-left"></i> Atrás
                    </Button>
                </div>

                <div className="col-md-12 mt-5">
                    <div className="row">
                        <div className="col-md-7">
                            <Form.Field>
                                <input type="text" placeholder="Buscar trabajador por: Apellidos y Nombres"/>
                            </Form.Field>
                        </div>

                        <div className="col-xs">
                            <Button color="blue">
                                <i className="fas fa-search"></i> Buscar
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="col-md-12 mt-3">
                    <h4>Lista de resultados: 0</h4>
                </div>
            </Form>
        )
    }

}