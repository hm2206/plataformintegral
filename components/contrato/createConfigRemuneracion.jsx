import React, { Component } from 'react';
import Modal from '../modal';
import { Form, Select, Button } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import { parseOptions } from '../../services/utils'
import atob from 'atob'
import Swal from 'sweetalert2';

export default class CreateConfigRemuneracion extends Component
{

    state = {
        base: "0",
        loading: false,
        type_remuneraciones: [],
        type_remuneracion_id: "",
        monto: 0
    }

    componentDidMount = async() => {
        await this.getTypeRemuneracion();
    }

    getTypeRemuneracion = async () => {
        this.setState({ loading: true });
        await unujobs.get('type_remuneracion?paginate=0')
        .then(res => this.setState({ type_remuneraciones: res.data }))
        .catch(err => console.log(err.message));    
        this.setState({ loading: false });
    }

    handleInput = ({name, value}) => {
        this.setState({ [name]: value });
    }

    create = async () => {
        this.setState({ loading: true });
        await unujobs.post(`info/${this.props.info.id}/add_config`, {
            type_remuneracion_id: this.state.type_remuneracion_id,
            base: this.state.base,
            monto: this.state.monto
        })
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
        })
        .catch(err => Swal.fire({ icon: 'error', text: 'Algo salió más!'}));    
        this.setState({ loading: false });
    }

    render() {
        return (
            <Modal show={true}
                {...this.props}
                titulo={<span><i className="fas fa-coins"></i>Agregar Remuneración</span>}
            >
                <div className="card-body">
                    <Form loading={this.state.loading}>
                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <Form.Field>
                                    <label htmlFor="">Tip. Remuneración</label>
                                    <Select
                                        name="type_remuneracion_id"
                                        value={this.state.type_remuneracion_id}
                                        onChange={(e, obj) => this.handleInput(obj)}
                                        placeholder="Select. Tip Remuneración"
                                        options={parseOptions(this.state.type_remuneraciones, ['sel-type', '', 'Select. Tip. Remuneración'], ['id', 'id', 'alias'])}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-12 mb-3">
                                <Form.Field>
                                    <label htmlFor="">Base Imponible</label>
                                    <Select
                                        placeholder="Select. Modo"
                                        name="base"
                                        value={this.state.base}
                                        onChange={(e, obj) => this.handleInput(obj)}
                                        options={[
                                            {key: "0", value: "0", text: "Si"},
                                            {key: "1", value: "1", text: "No"}
                                        ]}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-9 mb-3">
                                <Form.Field>
                                    <input type="number" 
                                        name="monto"
                                        value={this.state.monto}
                                        onChange={(e) => this.handleInput(e.target)}
                                        placeholder="Ingresar monto"
                                        step="any"
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-3">
                                <Button color="blue" fluid
                                    onClick={this.create}
                                >
                                    <i className="fas fa-save"></i>
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
            </Modal>
        );
    }

}