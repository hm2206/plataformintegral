import React, { Component } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Select, Icon, Checkbox } from 'semantic-ui-react';
import Show from '../show';
import storage from '../../services/storage.json';
import Swal from 'sweetalert2';
import { responsive } from '../../services/storage.json';


export default class Obligacion extends Component
{


    state = {
        obligaciones: [],
        type_aportacion_id: "",
        loader: true,
        form: {
            tipo_documento: "01",
            numero_de_documento: "",
            type_descuento_id: 8,
            beneficiario: "",
            banco_id: 1,
            numero_de_cuenta: "",
            monto: "",
            porcentaje: "",
            observacion: "S/D",
            fecha_de_inicio: "",
            fecha_de_termino: "",
            is_porcentaje: 1
        }
    }


    componentDidMount = async () => {
        await this.getObligaciones(this.props);
    }

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.historial && nextProps.historial.id != this.props.historial.id) {
            await this.getObligaciones(nextProps);
        }
        // send
        if (nextProps.send && nextProps.send != this.props.send) {
            await this.update();
        }
    }

    create = async () => {
        this.setState({ loader: true });
        let form = Object.assign({}, this.state.form);
        form.info_id = this.props.historial.info_id;
        await unujobs.post('type_obligacion', form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            // is success
            if (success) {
                await unujobs.post(`cronograma/${this.props.historial.cronograma_id}/add_obligacion`)
                .then(async res => {
                    let { success, message } = res.data;
                    let icon = success ? 'success' : 'error';
                    await Swal.fire({ icon, text: message });
                })
                .catch(err => Swal.fire({ icon: 'error', text: err.message }));
                await this.getObligaciones(this.props);
                await this.props.updatingHistorial();
            }
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
        this.setState({ loader: false });
    }

    getDatosReniec = async (dni) => {
        this.setState({ loader: true });
        await unujobs.get(`reniec/${dni}`)
        .then(res => {
            let { result, success } = res.data;
            if (success) {
                let data = {};
                data.name = 'beneficiario';
                data.value = `${result.paterno} ${result.materno} ${result.nombre}`;
                this.handleInput(data);
            } else {
                this.handleInput({ name: "beneficiario", value: "No se encontró resultado" })
            }
        })
        .catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    handleInput = ({ name, value }) => {
        let newObject = Object.assign({}, this.state.form);
        newObject[name] = value;
        this.setState({ form: newObject});
        if (this.state.form.tipo_documento == '01' &&  name == 'numero_de_documento' && value.length == 8) {
            this.getDatosReniec(value);
        }
        // setting
    }

    handleInputUpdate = ({ name, value }, index = 0) => {
        let { obligaciones } = this.state;
        let newObject = Object.assign({}, obligaciones[index]);
        newObject[name] = value;
        obligaciones[index] = newObject;
        this.setState({ obligaciones });
    }

    getObligaciones = async (props) => {
        this.setState({ loader: true });
        let { historial } = props;
        await unujobs.get(`historial/${historial.id}/obligacion`)
        .then(async res => {
            await this.setState({ obligaciones: res.data ? res.data : [] });
        }).catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    permisionAdd = () => {
        let { tipo_documento, numero_de_documento, beneficiario, monto, porcentaje } = this.state.form;
        return tipo_documento && numero_de_documento &&  beneficiario && (monto || porcentaje);
    }

    update = async () => {
        let form = new FormData;
        form.append('obligaciones', JSON.stringify(this.state.obligaciones));
        await unujobs.post(`obligacion/${this.props.historial.id}/all`, form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            Swal.fire({ icon, text: message });
            if (success) {
                await this.props.updatingHistorial();
            } 
            // recargar
            this.getObligaciones(this.props);
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
        this.props.setEdit(false);
        this.props.setSend(false);
        this.props.setLoading(false);
    }

    render() {

        let { obligaciones, form, loader } = this.state;
 
        return (
            <Form className="row" loading={loader}>

                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-4 col-lg-3 mb-2">
                            <Select
                                fluid
                                placeholder="Select. Tip. Documento"
                                options={storage.tipo_documento}
                                name="tipo_documento"
                                value={form.tipo_documento}
                                onChange={(e, obj) => this.handleInput(obj)}
                                disabled={!this.props.edit}
                            />
                        </div>

                        <div className="col-md-4 col-lg-3 mb-2">
                            <Form.Field>
                                <input type="text" 
                                    name="numero_de_documento"
                                    placeholder="Número de Documento"
                                    value={form.numero_de_documento}
                                    disabled={!this.props.edit}
                                    onChange={({ target }) => this.handleInput(target)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-4 col-lg-3 mb-2">
                            <Form.Field>
                                <input type="text" 
                                    placeholder="Beneficiario"
                                    name="beneficiario"
                                    value={form.beneficiario}
                                    disabled={!this.props.edit}
                                    onChange={({ target }) => this.handleInput(target)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-4 col-lg-3 mb-2">
                            <Form.Field>
                                <input type="text" 
                                    placeholder="Numero de Cuenta"
                                    name="numero_de_cuenta"
                                    value={form.numero_de_cuenta}
                                    disabled={!this.props.edit}
                                    onChange={({ target }) => this.handleInput(target)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-4 col-lg-3 mb-2">
                            <Form.Field>
                                <Select
                                    fluid
                                    placeholder="Select. Modo Descuento"
                                    options={[
                                        { key: "por", value: 1, text: "Desct. Porcentaje" },
                                        { key: "mon", value: 0, text: "Desct. Monto" }
                                    ]}
                                    name="is_porcentaje"
                                    value={form.is_porcentaje}
                                    onChange={(e, obj) => this.handleInput(obj)}
                                    disabled={!this.props.edit}
                                />
                            </Form.Field>
                        </div>

                        <Show condicion={form.is_porcentaje}>
                            <div className="col-md-4 col-lg-3 mb-2">
                                <Form.Field>
                                    <input type="number" 
                                        placeholder="Porcentaje"
                                        name="porcentaje"
                                        value={form.porcentaje}
                                        step="any"
                                        max="85"
                                        disabled={!this.props.edit}
                                        onChange={({ target }) => this.handleInput(target)}
                                    />
                                </Form.Field>
                            </div>
                        </Show>

                        <Show condicion={!form.is_porcentaje}>
                            <div className="col-md-4 col-lg-3 mb-2">
                                <Form.Field>
                                    <input type="number" 
                                        placeholder="Monto"
                                        name="monto"
                                        value={form.monto}
                                        step="any"
                                        disabled={!this.props.edit}
                                        onChange={({ target }) => this.handleInput(target)}
                                    />
                                </Form.Field>
                            </div>
                        </Show>

                        <div className="col-md-4 col-lg-2 mb-2">
                            <Form.Field>
                                <Show condicion={responsive.sm >= this.props.screenX}>
                                    Fecha de incio
                                </Show>
                                <input type="date" 
                                    title="Fecha de inicio"
                                    placeholder="Fecha de inicio"
                                    name="fecha_de_inicio"
                                    value={form.fecha_de_inicio}
                                    disabled={!this.props.edit}
                                    onChange={({ target }) => this.handleInput(target)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-4 col-lg-2 mb-2">
                            <Form.Field>
                                <Show condicion={responsive.sm >= this.props.screenX}>
                                    Fecha de término
                                </Show>
                                <input type="date" 
                                    title="Fecha de término"
                                    placeholder="Fecha de término"
                                    name="fecha_de_termino"
                                    value={form.fecha_de_termino}
                                    disabled={!this.props.edit}
                                    onChange={({ target }) => this.handleInput(target)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-4 col-lg-2 mb-2">
                            <Button color="green"
                                fluid
                                disabled={!this.permisionAdd()}  
                                onClick={this.create}  
                            >
                                <Icon name="plus"/> Agregar
                            </Button>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-12">
                    <hr/>
                </div>

                <h4 className="col-md-12 mt-1"><Icon name="list alternate"/> Lista de Obligaciones Judiciales:</h4>

                {obligaciones.map((obl, index) =>
                    <div className="col-md-12" key={`obl-${obl.id}`}>
                        <div className="row">
                            <div className="col-md-2">
                                <label htmlFor="">Tip. Documento</label>
                                <Select
                                    fluid
                                    placeholder="Select. Tip. Documento"
                                    options={storage.tipo_documento}
                                    value={obl.tipo_documento}
                                    disabled={true}
                                />
                            </div>

                            <div className="col-md-2 mb-2">
                                <label htmlFor="">N° de Documento</label>
                                <Form.Field>
                                    <input type="text" 
                                        defaultValue={obl.numero_de_documento}
                                        disabled={true}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-4 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Beneficiario</label>
                                    <input type="text" 
                                        defaultValue={obl.beneficiario}
                                        disabled={true}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-2 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° de Cuenta</label>
                                    <input type="text" 
                                        name="numero_de_cuenta"
                                        value={obl.numero_de_cuenta}
                                        disabled={!this.props.edit}
                                        onChange={({ target }) => this.handleInputUpdate(target, index)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-2 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Monto</label>
                                    <input type="number" 
                                        name="monto"
                                        value={obl.monto}
                                        onChange={({ target }) => this.handleInputUpdate(target, index)}
                                        disabled={obl.is_porcentaje || !this.props.edit}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-8 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Observación</label>
                                    <textarea
                                        rows="4"
                                        value={obl.observacion}
                                        name="observacion"
                                        disabled={!this.props.edit}
                                        onChange={({ target }) => this.handleInputUpdate(target, index)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-2 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Modo Descuento</label>
                                    <Select
                                        fluid
                                        placeholder="Select. Porcentaje"
                                        options={[
                                            { key: "por", value: 1, text: "Desct. Porcentaje" },
                                            { key: "mon", value: 0, text: "Desct. Monto" }
                                        ]}
                                        name="is_porcentaje"
                                        value={obl.is_porcentaje}
                                        onChange={(e, target) => this.handleInputUpdate(target, index)}
                                        disabled={!this.props.edit}
                                    />
                                </Form.Field>
                            </div>

                            <Show condicion={obl.is_porcentaje}>
                                <div className="col-md-2 mb-2">
                                    <Form.Field>
                                        <label htmlFor="">Porcentaje</label>
                                        <input type="number" 
                                            value={obl.porcentaje}
                                            disabled={!this.props.edit}
                                            step="any"
                                            name="porcentaje"
                                            onChange={({ target }) => this.handleInputUpdate(target, index)}
                                        />
                                    </Form.Field>
                                </div>
                            </Show>

                            <div className="col-md-12">
                                <hr/>
                            </div>
                        </div>

                    </div>    
                )}
            </Form>
        )
    }

}