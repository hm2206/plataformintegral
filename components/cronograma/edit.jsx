import React, { Component } from 'react'
import Modal from '../modal';
import atob from 'atob';
import { Button, Form } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Swal from 'sweetalert2';
import Router from 'next/router';

export default class Edit extends Component
{

    state = {
        id: "",
        loader: false,
    }

    componentDidMount = () => {
        this.setState((state, props) => ({ id: props.query.edit ? atob(props.query.edit) : "" }));
    }


    render() {
        return (
            <Modal
                show={true}
                {...this.props}
                titulo={<span><i className="fas fa-pencil-alt"></i> Editar cronograma: {this.state.id}</span>}
                md="9"
            >
                <Form className="card-body" loading={this.state.loader}>
                    <div className="row">
                        <div className="col-md-12">
                            <b>( <b className="text-red">*</b> ) Campos obligatorios</b>
                            <hr/>
                        </div>

                        <div className="col-md-4">
                            <Form.Field>
                                <label htmlFor="">Planilla</label>
                                <input type="text"/>
                            </Form.Field>

                            <Form.Field>
                                <label htmlFor="">Adicional</label>
                                <input type="text"/>
                            </Form.Field>
                        </div>

                        <div className="col-md-4">
                            <Form.Field>
                                <label htmlFor="">Año</label>
                                <input type="text"/>
                            </Form.Field>

                            <Form.Field>
                                <label htmlFor="">Remanente</label>
                                <input type="text"/>
                            </Form.Field>
                        </div>

                        <div className="col-md-4">
                            <Form.Field>
                                <label htmlFor="">Mes</label>
                                <input type="text"/>
                            </Form.Field>

                            <Form.Field>
                                <label htmlFor="">Dias</label>
                                <input type="text"/>
                            </Form.Field>
                        </div>

                        <div className="col-md-6 mt-3">
                            <Form.Field>
                                <label htmlFor="">Descripción</label>
                                <input type="text"/>
                            </Form.Field>

                            <Form.Field>
                                <label htmlFor="">Observación</label>
                                <textarea name="" id="" cols="30" rows="10"/>
                            </Form.Field>
                        </div>

                        <div className="col-md-2 mt-3">
                            <Form.Field>
                                <label htmlFor="">Sello</label>
                                <input type="text"/>
                            </Form.Field>
                        </div>

                        <div className="col-md-4 mt-3">
                            <Form.Field>
                                <label htmlFor="">Token (Opcional)</label>
                                <input type="text"/>
                            </Form.Field>
                        </div>

                        <div className="col-md-12 text-right">
                            <hr/>
                            <Button color="red">
                                <i className="fas fa-times"></i> Cancelar
                            </Button>

                            <Button color="teal">
                                <i className="fas fa-save"></i> Guardar cambios
                            </Button>
                        </div>
                    </div>
                </Form>
            </Modal>
        );
    }

}