import React, { Component } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Select, Icon } from 'semantic-ui-react';
import { parseOptions, Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import Show from '../show';
import { responsive } from '../../services/storage.json';


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
        let answer = await Confirm('warning', '¿Deseas guardar el Sindicato/Afiliación?');
        if (answer) {
            this.setState({ loader: true });
            let payload = {
                historial_id: this.props.historial.id,
                type_sindicato_id: this.state.sindicato_id
            };
            let { historial } = this.props;
            // send
            await unujobs.post('sindicato', payload, { headers: { CronogramaID: historial.cronograma_id } })
            .then(async res => {
                this.props.setLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                this.setState({ loader: false });
                await this.props.updatingHistorial();
                await this.getSindicatos(this.props);
            })
            .catch(err => Swal.fire({ icon: 'error', text: err.message }));
            this.setState({ loader: false });
            this.props.setLoading(false);
        }
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
        let answer = await Confirm('warning', '¿Deseas eliminar el Sindicato/Afiliación?');
        if (answer) {
            this.setState({ loader: true });
            let { historial } = this.props;
            await unujobs.post(`sindicato/${id}`, { _method: 'DELETE' }, { headers: { CronogramaID: historial.cronograma_id } })
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await this.props.updatingHistorial();
                await this.getSindicatos(this.props);
            })
            .catch(err => Swal.fire({ icon: 'error', text: err.message }));
            this.setState({ loader: false });
        }
    }

    render() {

        let { sindicato_id, type_sindicatos, sindicatos, loader } = this.state;
 
        return (
            <Form className="row" loading={loader}>

                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-8 col-lg-5 col-10 mb-1">
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
                        <div className="col-xs col-md-4 col-lg-2 col-2">
                            <Button color="green"
                                disabled={!sindicato_id || !this.props.edit}   
                                onClick={this.create} 
                                fluid
                            >
                                <i className="fas fa-plus"></i> {responsive.md < this.props.screenX ? ' Agregar' : ''}
                            </Button>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-12">
                    <hr/>
                </div>

                {sindicatos.map((obj, index) => 
                <div className="col-md-12 col-lg-4 mb-2 col-12" key={`sindicato-${obj.id}`}>
                    <div className="row">
                            <div className="col-md-9 col-lg-10 col-10">
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
                            <div className="col-md-3 col-lg-2 col-2">
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