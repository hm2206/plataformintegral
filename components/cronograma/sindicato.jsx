import React, { Component } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Select, Icon } from 'semantic-ui-react';
import { parseOptions } from '../../services/utils';
import Swal from 'sweetalert2';
import Show from '../show';


export default class Sindicato extends Component
{


    state = {
        type_sindicatos: [],
        sindicatos: [],
        sindicato_id: "",
        loader: true,
    }


    componentDidMount = async () => {
        await this.getTypeSindicatos();
        await this.getSindicatos(this.props);
    }

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.historial && nextProps.historial.id != this.props.historial.id) {
            await this.getSindicatos(nextProps);
        }
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value });
    }

    create = async () => {
        this.setState({ loader: true });
        let payload = {
            historial_id: this.props.historial.id,
            type_sindicato_id: this.state.sindicato_id
        };
        // send
        await unujobs.post('sindicato', payload)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) {
                this.setState({ loader: false });
                await this.props.updatingHistorial();
                this.getSindicatos(this.props);
            }
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
        this.setState({ loader: false });
    }

    getSindicatos = async (props) => {
        this.setState({ loader: true });
        let { historial } = props;
        await unujobs.get(`historial/${historial.id}/sindicato`)
        .then(async res => await this.setState({ sindicatos: res.data ? res.data : [] }))
        .catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    getTypeSindicatos = async () => {
        await unujobs.get('type_sindicato')
        .then(res => this.setState({ type_sindicatos: res.data }))
        .catch(err => console.log(err.message));
    }

    delete = async (id) => {
        this.setState({ loader: true });
        await unujobs.post(`sindicato/${id}`, { _method: 'DELETE' })
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            Swal.fire({ icon, text: message });
            if (success) {
                this.setState({ loader: false });
                await this.props.updatingHistorial();
                this.getSindicatos(this.props);
            }
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
        this.setState({ loader: false });
    }

    render() {

        let { sindicato_id, type_sindicatos, sindicatos, loader } = this.state;
 
        return (
            <Form className="row" loading={loader}>

                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-4">
                            <Select
                                fluid
                                placeholder="Select. Sindicato"
                                options={parseOptions(type_sindicatos, ['sel-type', '', 'Select. Sindicato'], ['id', 'id', 'nombre'])}
                                name="sindicato_id"
                                value={sindicato_id}
                                onChange={(e, obj) => this.handleInput(obj)}
                                disabled={!this.props.edit}
                            />
                        </div>
                        <div className="col-xs">
                            <Button color="green"
                                disabled={!sindicato_id}   
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

                {sindicatos.map((obj, index) => 
                <div className="col-md-4 mb-2" key={`sindicato-${obj.id}`}>
                    <div className="row">
                            <div className="col-md-10">
                                <Button fluid>
                                    {obj.type_sindicato.nombre} 
                                    <Show condicion={obj.porcentaje > 0}>
                                        <span className="ml-2 badge badge-dark">%{obj.porcentaje}</span>
                                    </Show>
                                    <Show condicion={obj.porcentaje == 0}>
                                        <span className="ml-2 badge badge-dark">S./{obj.monto}</span>
                                    </Show>
                                </Button>
                            </div>    
                            <div className="col-md-2">
                                <Button color="red" fluid
                                    disabled={!this.props.edit}
                                    onClick={(e) => this.delete(obj.id)}
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            </Form>
        )
    }

}