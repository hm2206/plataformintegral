import React, { Component } from 'react';
import Modal from '../modal';
import { Icon, Select, Form, Button } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Router from 'next/router';
import atob from 'atob';
import { parseOptions, Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import Show from '../../components/show';
import { url } from '../../env.json';

export default class ImpDescuento extends Component
{

    state = {
        id: "",
        loading: false,
        type_descuentos: [],
        type_descuento_id: "",
        monto: 0,
        paso: "VALIDAR"
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
        .then(async res => {
            let newType = await res.data.filter(obj => obj.edit == 1);
            this.setState({ type_descuentos: newType });
        })
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
            })
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
                titulo={<span><Icon name="cloud upload"/> Importar Descuentos</span>}
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

                            {/* Validar archivo */}
                            <Show condicion={this.state.paso == 'VALIDAR'}>
                                <div className="col-md-12 mb-5 text-center">
                                    <b><u>VALIDAR ARCHIVO.</u></b> <br/>
                                    <ul className="pl-5 text-left mt-3">
                                        <li>1. Descargar Formato. <a href={`${url.URL_UNUJOBS || ""}/formatos/imp_descuento.xlsx`} target="_blank" className="text-success"><i className="fas fa-file-excel"></i> Archivo Excel</a></li>
                                        <li>2. Rellenar los campos correspondientes.</li>
                                        <li>3. Subir el archivo del formato </li>
                                        <li>4. Esperar que el sistema valide el archivo.</li>
                                    </ul>
                                </div>

                                <div className="col-md-5 mb-1">
                                    <Form.Field>
                                        <label htmlFor="validar-import"
                                            className="ui button"
                                        >
                                            <Icon name="upload"/>
                                            <input type="file"
                                                id="validar-import"
                                                hidden
                                                name="validar"
                                                disabled={!this.state.type_descuento_id}
                                            />
                                            Archivo
                                        </label>
                                    </Form.Field>
                                </div>

                                <div className="col-md-3 mb-1">
                                    <Button fluid color="yellow"
                                        onClick={this.update}
                                        disabled={!this.state.type_descuento_id}
                                    >
                                        <Icon name="cloud upload"/>Subir y Validar
                                    </Button>
                                </div>
                            </Show>
                        </div>
                    </Form>
                </div>
            </Modal>
        )
    }

}