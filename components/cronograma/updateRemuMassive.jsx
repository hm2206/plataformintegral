import React, { Component } from 'react';
import Modal from '../modal';
import { Icon, Select, Form, Button } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Router from 'next/router';
import atob from 'atob';
import { parseOptions, Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

export default class UpdateRemuMassive extends Component
{

    state = {
        id: "",
        loading: false,
        type_remuneraciones: [],
        metas: [],
        cargos: [],
        type_categorias: [],
        form: {
            type_descuento_id: "",
            meta_id: "",
            cargo_id: "",
            monto: 0
        }
    };

    componentDidMount = async () => {
        await this.setting();
        await this.getTypeRemuneracion();
        this.getMetas();
        this.getCargos();
    }

    setting = async () => {
        let { query } = Router;
        await this.setState({ id: query.id ? atob(query.id) : "error" });
    }
    
    getTypeRemuneracion = async () => {
        this.setState({ loading: true });
        await unujobs.get(`cronograma/${this.state.id}/type_remuneracion`)
        .then(res => this.setState({ type_remuneraciones: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    getMetas = () => {
        let { id } = this.state;
        unujobs.get(`cronograma/${id}/meta`)
        .then(res => this.setState({metas: res.data}))
        .catch(err => console.log(err.message));
    }

    getCargos = () => {
        unujobs.get(`cronograma/${this.state.id}/cargo`)
        .then(async res => {
            this.setState({ cargos: res.data });
        }).catch(err =>  console.log(err.message));
    }

    getTypeCategorias = (id) => {
        if (id) {
            unujobs.get(`cargo/${id}`)
            .then(async res => {
                let { type_categorias } = res.data;
                this.setState({ type_categorias: type_categorias ? type_categorias : [] });
            }).catch(err =>  console.log(err.message));
        } else this.setState({ type_categorias: [] });
    }

    handleInput = ({ name, value }) => {
        this.setState(state => {
            state.form[name] = value;
            return { form: state.form };
        });
        // handle change
        this.handleChangeInput({ name, value });
    }

    handleChangeInput = async ({ name, value }) => {
        switch (name) {
            case 'cargo_id':
                await this.getTypeCategorias(value);
                break;
            default:
                break;
        }
    }

    update = async () => {
        let value = await Confirm("warning", "¿Estas seguró en actualizar la remuneración masivamente?", "Confirmar")
        if (value) {
            this.setState({ loading: true });
            let { form, id } = this.state;
            form._method = 'PUT';
            await unujobs.post(`cronograma/${id}/update_remuneracion`, form, { headers: { CronogramaID: this.state.id } })
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await this.props.updatingHistorial();
            }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
            this.setState({ loading: false });
        }
    }

    render() {
        
        let { form } = this.state;

        return (
            <Modal show={true} {...this.props}
                titulo={<span><Icon name="cart arrow up"/> Remuneración Masiva</span>}
            >
                <div className="card-body">
                    <Form loading={this.state.loading}>
                        <div className="row">
                            <div className="col-md-4 mb-1">
                                <Form.Field>
                                    <Select
                                        options={parseOptions(this.state.type_remuneraciones, ["select-rem-key", "", "Select. por clave"], ["id", "id", "key"])}
                                        placeholder="Select por clave"
                                        name="type_remuneracion_id"
                                        value={form.type_remuneracion_id || ""}
                                        onChange={(e, obj) => this.handleInput(obj)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-8 mb-1">
                                <Form.Field>
                                    <Select
                                        options={parseOptions(this.state.type_remuneraciones, ["select-rem", "", "Select. por descripción"], ["id", "id", "alias"])}
                                        placeholder="Select por descripción"
                                        name="type_remuneracion_id"
                                        value={form.type_remuneracion_id || ""}
                                        onChange={(e, obj) => this.handleInput(obj)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-12">
                                <div className="row">
                                    <div className="col-md-12 mt-2">
                                        <hr/>
                                        <i className="fas fa-filter"></i> Filtros
                                        <hr/>
                                    </div>
                                    
                                    <div className="col-md-6 mb-2">
                                        <Form.Field>
                                            <Select
                                                options={parseOptions(this.state.metas, ["select-meta", "", "Select. Meta"], ["id", "id", "meta"])}
                                                placeholder="Select Meta"
                                                name="meta_id"
                                                value={form.meta_id || ""}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <Form.Field>
                                            <Select
                                                options={parseOptions(this.state.cargos, ["select-cargo", "", "Select. Partición Pre."], ["id", "id", "alias"])}
                                                placeholder="Select Particion Pre."
                                                name="cargo_id"
                                                value={form.cargo_id || ""}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <Form.Field>
                                            <Select
                                                options={parseOptions(this.state.type_categorias, ["select-categoria", "", "Select. Tip. Categoría"], ["id", "id", "descripcion"])}
                                                placeholder="Select Tip. Categoría"
                                                name="type_categoria_id"
                                                value={form.type_categoria_id || ""}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12 mb-1">
                                <hr/>
                            </div>

                            <div className="col-md-9 mb-1 mt-5">
                                <Form.Field>
                                    <input type="number" step="any"
                                        placeholder="Ingrese un monto. Ejem. 0.00"
                                        name="monto"
                                        value={form.monto}
                                        onChange={(e) => this.handleInput(e.target)}
                                        disabled={!form.type_remuneracion_id}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-3 mb-1 mt-5">
                                <Button fluid color="blue"
                                    onClick={this.update}
                                    disabled={!form.type_remuneracion_id}
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