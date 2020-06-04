import React, { Component } from 'react';
import Modal from '../modal';
import { Icon, Select, Form, Button } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Router from 'next/router';
import atob from 'atob';
import { parseOptions, Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

export default class UpdateDesctMassive extends Component
{

    state = {
        id: "",
        loading: false,
        type_descuentos: [],
        type_descuento_id: "",
        monto: 0
    };

    componentDidMount = async () => {
        await this.setting();
        await this.getTypeDescuento();
    }

    setting = async () => {
        let { query } = Router;
        await this.setState({ id: query.id ? atob(query.id) : "error" });
    }
    
    getTypeDescuento = async () => {
        this.setState({ loading: true });
        await unujobs.get(`cronograma/${this.state.id}/type_descuento`)
        .then(res => this.setState({ type_descuentos: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value });
    }

    update = async () => {
        let value = await Confirm("warning", "¿Estas seguró en actualizar el descuento masivamente?", "Confirmar")
        if (value) {
            this.setState({ loading: true });
            await unujobs.post(`cronograma/${this.state.id}/update_descuento`, { 
                _method: 'PUT',
                type_descuento_id: this.state.type_descuento_id,
                monto: this.state.monto 
            }, { headers: { CronogramaID: this.state.id } })
            .then(async res => {
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
            }).catch(err => Swal.fire({ icon: 'error', text: "Algo salió mal!" }));
            this.setState({ loading: false, type_descuento_id: "", monto: 0 });
        }
    }

    render() {
        return (
            <Modal show={true} {...this.props}
                titulo={<span><Icon name="cart arrow down"/> Descuento Masivo</span>}
            >
                <div className="card-body">
                    <Form loading={this.state.loading}>
                        <div className="row">
                            <div className="col-md-4 mb-1">
                                <Form.Field>
                                    <Select
                                        options={parseOptions(this.state.type_descuentos, ["select-desct", "", "Select. por clave"], ["id", "id", "key"])}
                                        placeholder="Select por clave"
                                        name="type_descuento_id"
                                        value={this.state.type_descuento_id}
                                        onChange={(e, obj) => this.handleInput(obj)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-8 mb-1">
                                <Form.Field>
                                    <Select
                                        options={parseOptions(this.state.type_descuentos, ["select-desct", "", "Select. por descripción"], ["id", "id", "descripcion"])}
                                        placeholder="Select por descripción"
                                        name="type_descuento_id"
                                        value={this.state.type_descuento_id}
                                        onChange={(e, obj) => this.handleInput(obj)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-12 mb-1">
                                <hr/>
                            </div>

                            <div className="col-md-12 mb-5 text-center">
                                <b><u>IMPORTANTE.</u></b> <br/>
                                Al actualizar un descuento masivamente, <br/> se desactivará el calculo automático del descuento!!!
                            </div>

                            <div className="col-md-9 mb-1">
                                <Form.Field>
                                    <input type="number" step="any"
                                        placeholder="Ingrese un monto. Ejem. 0.00"
                                        name="monto"
                                        value={this.state.monto}
                                        onChange={(e) => this.handleInput(e.target)}
                                        disabled={!this.state.type_descuento_id}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-3 mb-1">
                                <Button fluid color="blue"
                                    onClick={this.update}
                                    disabled={!this.state.type_descuento_id}
                                >
                                    <i className="fas fa-save"></i> Guardar
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
            </Modal>
        )
    }

}