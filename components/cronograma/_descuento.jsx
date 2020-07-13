import React, { Component } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Input, Icon } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Show from '../show';
import { Confirm } from '../../services/utils';


export default class Descuento extends Component
{


    state = {
        descuentos: [],
        loader: false,
        total_bruto: 0,
        total_desct: 0,
        base: 0,
        total_neto: 0,
        payload: []
    }


    async componentDidMount() {
        await this.getDescuentos(this.props);
    }

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.historial != this.props.historial) {
            await this.getDescuentos(nextProps);
        }
        // update 
        if (nextProps.edit && nextProps.send && nextProps.send != this.props.send) {
            await this.updateDescuentos();
        }
        // update al cancelar
        if (!nextProps.edit && nextProps.edit != this.props.edit) {
            await this.setState({ descuentos:  nextProps.data});
        }
    }

    getDescuentos = async (props) => {
        let datos = JSON.parse(JSON.stringify(props));
        this.setState({ 
            descuentos: datos.data,
            total_bruto: datos.historial.total_bruto,
            total_desct: datos.historial.total_desct,
            base: datos.historial.base,
            total_neto: datos.historial.total_neto
        });
    }

    handleMonto = (index, value, obj) => {
        this.setState(state => {
            state.payload[index] = { id: obj.id, monto: value };
            let newArray = state.descuentos;
            let newObj = Object.assign({}, obj);
            newObj.monto = value;
            newArray[index] = newObj; 
            return { descuentos: newArray, payload: state.payload }
        });
    }
    
    updateDescuentos = async () => {
        const form = new FormData();
        let { historial } = this.props;
        form.append('_method', 'PUT');
        form.append('descuentos', JSON.stringify(this.state.payload));
        await unujobs.post(`descuento/${this.props.historial.id}/all`, form, { headers: { CronogramaID: historial.cronograma_id } })
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            this.props.setLoading(false);
            await Swal.fire({ icon: 'success', text: message });
            this.props.setEdit(false);
            this.props.setSend(false);
            await this.props.updatingHistorial();
        })
        .catch(err => {
            Swal.fire({ icon: 'error', text: err.message })
            this.props.setSend(false);
            this.props.setLoading(false);
        });
    }

    handleEdit = async (obj, edit = 0) => {
        let res = await Confirm("warning", `Deseas ${edit ? 'Desactivar' : 'Activar'} el calculo automático para "${obj.descripcion}"`, "Confirmar");
        if (res) {
            this.props.setLoading(true);
            let { historial } = this.props; 
            this.setState({ loader: true });
            await unujobs.post(`descuento/${obj.id}/edit`, { _method: 'PUT', edit }, { headers: { CronogramaID: historial.cronograma_id } })
            .then(async res => { 
                let { success, message } = res.data;
                this.props.setLoading(false);
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await this.props.updatingHistorial();
            }).catch(err => Swal.fire({ icon: 'error', text: err.message }))
            this.props.setLoading(false);
            this.props.setEdit(false);
        }
    }

    render() {

        let { descuentos, total_bruto, total_desct, total_neto, base, loader } = this.state;
 
        return (
            <Form className="row">
                <div className="col-md-12">
                    <div className="row justify-content-center">
                        <b className="col-md-3 col-6 mb-1">
                            <Button basic loading={loader} fluid color="black">
                                {loader ? 'Cargando...' : `Total Bruto: S/ ${total_bruto}`}
                            </Button>
                        </b>
                        <b className="col-md-3 col-6 mb-1">
                            <Button basic loading={loader} fluid color="black">
                                {loader ? 'Cargando...' : `Total Descuentos: S/ ${total_desct}`}
                            </Button>
                        </b>
                        <b className="col-md-3 col-6 mb-1">
                            <Button basic loading={loader} fluid color="black">
                                {loader ? 'Cargando...' : `Base Imponible: S/ ${base}`}
                            </Button>
                        </b>
                        <b className="col-md-3 col-6 mb-1">
                            <Button basic loading={loader} fluid color="black">
                                {loader ? 'Cargando...' : `Total Neto: S/ ${total_neto}`}
                            </Button>
                        </b>
                    </div>
                </div>
                
                <div className="col-md-12">
                    <hr/>
                </div>

                {descuentos.map((obj, index) => 
                    <div  key={`remuneracion-${obj.id}`}
                         className="col-md-3 mb-3"
                    >
                        <span className={obj.monto > 0 ? 'text-red' : ''}>
                            {obj.key}
                        </span>
                            .-
                        <span className={obj.monto > 0 ? 'text-primary' : ''}>
                            {obj.descripcion}
                        </span>
                        <Form.Field>
                            <div className="row justify-aligns-center">
                                <Show condicion={obj.edit}>
                                    <div className={this.props.edit ? 'col-md-9 col-9' : 'col-md-12 col-12'}>
                                        <input type="number"
                                            step="any" 
                                            value={obj.monto}
                                            disabled={!this.props.edit}
                                            onChange={({target}) => this.handleMonto(index, target.value, obj)}
                                            min="0"
                                        />
                                    </div>

                                    <Show condicion={this.props.edit}>
                                        <div className="col-md-3 col-3">
                                            <Button 
                                                icon="asl"
                                                onClick={(e) => this.handleEdit(obj, 0)}
                                                style={{ width: "100%", height: "100%" }}
                                                size="small"
                                                basic
                                                disabled={this.state.loading || !this.props.edit}>
                                            </Button>
                                        </div>
                                    </Show>
                                </Show>

                                <Show condicion={!obj.edit}>
                                    <Show condicion={!this.props.edit}>
                                        <div className="col-md-12 col-12">
                                            <Input icon='wait' iconPosition='left' 
                                                value={obj.monto} 
                                                disabled
                                                onChange={({target}) => this.handleMonto(index, target.value, obj)}
                                            />
                                        </div>
                                    </Show>

                                    <Show condicion={this.props.edit}>
                                        <div className="col-md-9 col-9">
                                            <input type="number"
                                                step="any" 
                                                value={obj.monto}
                                                disabled={!this.props.edit}
                                                onChange={({target}) => this.handleMonto(index, target.value, obj)}
                                                disabled
                                                min="0"
                                            />
                                        </div>
                                    </Show>

                                    <Show condicion={this.props.edit}>
                                        <div className="col-md-3 col-3">
                                            <Button 
                                                icon="wait"
                                                onClick={(e) => this.handleEdit(obj, 1)}
                                                style={{ width: "100%", height: "100%" }}
                                                size="small"
                                                disabled={this.state.loading || !this.props.edit}>
                                            </Button>
                                        </div>
                                    </Show>
                                </Show>
                            </div>
                        </Form.Field>
                    </div>
                )}
            </Form>
        )
    }

}