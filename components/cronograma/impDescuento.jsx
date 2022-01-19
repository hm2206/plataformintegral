import React, { Component } from 'react';
import Modal from '../modal';
import { Icon, Form, Button } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Router from 'next/router';
import atob from 'atob';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import Show from '../../components/show';
import { SelectCronogramaTypeDescuento} from '../select/cronograma';

export default class ImpDescuento extends Component
{

    state = {
        id: "",
        loading: false,
        block: false,
        type_descuentos: [],
        type_descuento_id: "",
        validar: null,
        imp_descuento: null,
        paso: "VALIDAR",
        btn: "Archivo"
    };

    componentDidMount = async () => {
        await this.setting();
    }

    setting = async () => {
        let { query } = Router;
        await this.setState({ id: query.id ? atob(query.id) : "error" });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value });
    }

    handleFile = ({ name, value, files }) => {
        if (files && files.length > 0) {
            this.setState({ [name]: files[0] });
        }
    }

    setPaso = async (name = 'VALIDAR') => {
        let validar = await Confirm("warning", `¿Deseas Ir al paso: ${name}?`, "Confirmar");
        if (validar) this.setState({ paso: name, block: name == 'PROCESAR', validar: null, imp_descuento: null });
    }

    validar = async () => {
        let value = await Confirm("warning", "¿Estas seguró en validar el archivo?", "Validar")
        if (value) {
            this.setState({ loading: true });
            let form = new FormData();
            form.append('cronograma_id', this.state.id);
            form.append('validar', this.state.validar);
            await unujobs.post(`import/descuento/${this.state.type_descuento_id}/validar`, form)
            .then(async res => {
                let { success, message, filename, name, type } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                if (success) {
                    let file = `data:${type};base64,${filename}`;
                    let a = document.createElement('a');
                    a.href = file;
                    a.download = name;
                    a.target = '_blank';
                    await a.click();
                    await this.setState({ paso: 'PROCESAR', block: true });
                }
            })
            .catch(err => Swal.fire({ icon: 'error', text: "Algo salió mal!" }));
            this.setState({ loading: false });
        }
    }

    importar = async () => {
        let value = await Confirm("warning", "¿Estas seguró en importar el archivo?", "Importar")
        if (value) {
            this.setState({ loading: true });
            let form = new FormData();
            form.append('cronograma_id', this.state.id);
            form.append('imp_descuento', this.state.imp_descuento);
            await unujobs.post(`import/descuento/${this.state.type_descuento_id}/importar`, form)
            .then(async res => {
                let { success, message, filename, name, type } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                if (success) {
                    let file = `data:${type};base64,${filename}`;
                    let a = document.createElement('a');
                    a.href = file;
                    a.download = name;
                    a.target = '_blank';
                    await a.click();
                    await this.setState({ paso: 'VALIDAR', block: false });
                    if (typeof this.props.onSave == 'function') this.props.onSave();
                }
            })
            .catch(err => Swal.fire({ icon: 'error', text: "Algo salió mal!" }));
            this.setState({ loading: false });
        }
    }

    render() {
        return (
            <Modal show={true} {...this.props}
                titulo={<span><Icon name="cloud upload"/> Importar Descuentos</span>}
            >
                <div className="card-body">
                    <Form loading={this.state.loading}>
                        <div className="row justify-content-center">
                            <div className="col-md-12 mb-1">
                                <Form.Field>
                                    <SelectCronogramaTypeDescuento
                                        name="type_descuento_id"
                                        cronograma_id={this.state.id}
                                        value={this.state.type_descuento_id}
                                        onChange={(e, obj) => this.handleInput(obj)}
                                        disabled={this.state.block}
                                        query={`?edit=1`}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-12 mb-1">
                                <hr/>
                            </div>

                            {/* Validar archivo */}
                            <Show condicion={this.state.paso == 'VALIDAR'}>
                                <div className="col-md-12 mb-5 text-center">
                                    <b><u>VALIDAR ARCHIVO.</u></b> 
                                    <Button size="mini" 
                                        className="ml-2" 
                                        basic 
                                        color="olive"
                                        disabled={!this.state.type_descuento_id || this.state.loading}
                                        onClick={(e) => this.setPaso('PROCESAR')}
                                    >
                                        <i className="fas fa-arrow-right"></i>
                                    </Button> 
                                    <br/>
                                    <ul className="pl-5 text-left mt-3">
                                        <li>1. Descargar Formato. <a href={`${process?.env?.NEXT_PUBLIC_URL_UNUJOBS || ""}/formatos/validar_descuento.xlsx`} target="_blank" className="text-success"><i className="fas fa-file-excel"></i> Archivo Excel</a></li>
                                        <li>2. Rellenar los campos correspondientes.</li>
                                        <li>3. Subir el archivo del formato </li>
                                        <li>4. Esperar que el sistema valide el archivo.</li>
                                    </ul>
                                </div>

                                <div className="col-md-5 mb-1">
                                    <Form.Field>
                                        <label htmlFor="validar-import"
                                            className={`ui button ${this.state.validar ? 'primary basic' : ''}`}
                                        >
                                            <Icon name={this.state.validar ? 'check' : 'upload'}/>
                                            <input type="file"
                                                id="validar-import"
                                                hidden
                                                name="validar"
                                                disabled={!this.state.type_descuento_id}
                                                onChange={(e) => this.handleFile(e.target)}
                                            />
                                            {this.state.validar ? this.state.validar && this.state.validar.name : 'Archivo'}
                                        </label>
                                    </Form.Field>
                                </div>

                                <div className="col-md-3 mb-1">
                                    <Button fluid color="yellow"
                                        onClick={this.validar}
                                        disabled={!this.state.type_descuento_id || !this.state.validar}
                                    >
                                        <Icon name="cloud upload"/>Subir y Validar
                                    </Button>
                                </div>
                            </Show>

                            {/* Procesar descuento*/}
                            <Show condicion={this.state.paso == 'PROCESAR'}>
                                <div className="col-md-12 mb-5 text-center">
                                    <Button size="mini" 
                                        className="mr-2" 
                                        basic 
                                        color="olive"
                                        onClick={(e) => this.setPaso('VALIDAR')}
                                        disabled={!this.state.type_descuento_id || this.state.loading}
                                    >
                                        <i className="fas fa-arrow-left"></i>
                                    </Button> 
                                    <b><u>PROCESAR ARCHIVO.</u></b> 
                                    <br/>
                                    <ul className="pl-5 text-left mt-3">
                                        <li>1. Revisar el archivo y corregir errores</li>
                                        <li>2. Subir archivo rectificado.</li>
                                        <li>3. Esperar que el sistema importe los descuentos.</li>
                                    </ul>
                                </div>

                                <div className="col-md-5 mb-1">
                                    <Form.Field>
                                        <label htmlFor="imp_descuento"
                                            className={`ui button ${this.state.imp_descuento ? 'black text-white' : ''}`}
                                        >
                                            <Icon name={this.state.imp_descuento? 'check' : 'upload'}/>
                                            <input type="file"
                                                id="imp_descuento"
                                                hidden
                                                name="imp_descuento"
                                                disabled={!this.state.type_descuento_id}
                                                onChange={(e) => this.handleFile(e.target)}
                                            />
                                            {this.state.imp_descuento ? this.state.imp_descuento && this.state.imp_descuento.name : 'Archivo'}
                                        </label>
                                    </Form.Field>
                                </div>

                                <div className="col-md-4 mb-1">
                                    <Button fluid color="olive"
                                        onClick={this.importar}
                                        disabled={!this.state.type_descuento_id || !this.state.imp_descuento}
                                    >
                                        <Icon name="cloud upload"/>Importar Descuentos
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