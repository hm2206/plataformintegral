import React, { Component } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Select, Icon } from 'semantic-ui-react';
import { parseOptions } from '../../services/utils';
import Swal from 'sweetalert2';
import { responsive } from '../../services/storage.json'


export default class Aportacion extends Component
{


    state = {
        payload: [],
        type_aportaciones: [],
        aportaciones: [],
        type_aportacion_id: "",
        loader: false,
    }


    componentDidMount = async () => {
        this.getAportaciones(this.props);
        await this.getTypeAportaciones();
    }

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.historial && nextProps.historial.id != this.props.historial.id) {
            await this.getAportaciones(nextProps);
        }
        // update aportaciones
        if (nextProps.aportaciones != this.props.aportaciones) {
            await this.getAportaciones(nextProps);
        } else {
            await this.getAportaciones(nextProps);
        }
    }

    create = async () => {
        this.setState({ loader: true });
        await unujobs.post('aportacion', {
            historial_id: this.props.historial.id,
            type_aportacion_id: this.state.type_aportacion_id
        })
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            Swal.fire({ icon, text: message });
            if (success) {
                this.setState({ loader: false });
                await this.props.updatingHistorial();
                this.getAportaciones(this.props);
            }
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
        await this.setState({ loader: false });
    }

    _delete = async (id) => {
        this.setState({ loader: true });
        await unujobs.post(`aportacion/${id}`, { _method: "DELETE" })
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            Swal.fire({ icon, text: message });
            if (success) {
                await this.props.updatingHistorial();
                this.setState({ loader: false });
                this.getAportaciones(this.props);
            }
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
        this.setState({ loader: false });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value });
    }

    getAportaciones = async (props) => {
        this.setState({ aportaciones: props.data });
    }

    getTypeAportaciones = async () => {
        await unujobs.get('type_aportacion')
        .then(res => this.setState({ type_aportaciones: res.data }))
        .catch(err => console.log(err.message));
    }

    handleMonto = (id, monto, index) => {
        let newPayload = this.state.payload;
        newPayload[index] = { id, monto };
        this.setState({ payload: newPayload });
    }

    render() {

        let { aportaciones, type_aportacion_id, type_aportaciones, loader } = this.state;
 
        return (
            <Form className="row" loading={loader}>

                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-8 col-lg-5 col-10">
                            <Select
                                labeled="Select. Aportación Empleador"
                                fluid
                                placeholder="Select. Aportacion Empleador"
                                options={parseOptions(type_aportaciones, ['sel-type', '', 'Select. Aportación Empleador'], ['id', 'id', 'descripcion'])}
                                name="type_aportacion_id"
                                value={type_aportacion_id}
                                onChange={(e, obj) => this.handleInput(obj)}
                                disabled={!this.props.edit}
                            />
                        </div>
                        <div className="col-xs col-lg-2 col-md-4 col-2">
                            <Button color="green"
                                disabled={!this.props.edit || !type_aportacion_id}
                                onClick={this.create}    
                            >
                                <i className="fas fa-plus"></i> {responsive.md < this.props.screenX ? 'Agregar' : ''}
                            </Button>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-12">
                    <hr/>
                </div>

                {aportaciones.map((obj, index) => 
                    <div  key={`remuneracion-${obj.id}`}
                         className="col-md-12 mb-1 col-lg-4"
                    >
                        <div className="row">
                            <div className="col-md-10 col-10 col-lg-10">
                                <Button 
                                    fluid
                                >
                                    { obj.key }.-{ obj.descripcion } 
                                    <i className="fas fa-arrow-right ml-1 mr-1"></i> 
                                    <small className="badge badge-dark">S./ { obj.monto }</small>
                                </Button>
                            </div>

                            <div className="col-md-2 col-2 col-lg-2">
                                <Button color="red"
                                    fluid
                                    onClick={(e) => this._delete(obj.id)}
                                    disabled={!this.props.edit}
                                >
                                    <i className="fas fa-trash"></i>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Form>
        )
    }

}