import React, { Component } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Input } from 'semantic-ui-react';
import Swal from 'sweetalert2';


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
        if (nextProps.send && nextProps.send != this.props.send) {
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
        form.append('_method', 'PUT');
        form.append('descuentos', JSON.stringify(this.state.payload));
        await unujobs.post(`descuento/${this.props.historial.id}/all`, form)
        .then(async res => {
            let { success, message, body } = res.data;
            let icon = success ? 'success' : 'error';
            if (success) {
                await this.props.updatingHistorial();
                this.setState({
                    total_bruto: body.total_bruto,
                    total_desct: body.total_desct,
                    total_neto: body.total_neto,
                    base: body.base
                });
            } else {
                this.props.setSend(false);
                this.props.setLoading(false);
            }
            await Swal.fire({ icon, text: message });
        })
        .catch(err => {
            Swal.fire({ icon: 'error', text: err.message })
            this.props.setSend(false);
            this.props.setLoading(false);
        });
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
                         className="col-md-3 mb-1"
                    >
                        <span className={obj.monto > 0 ? 'text-red' : ''}>
                            {obj.key}
                        </span>
                            .-
                        <span className={obj.monto > 0 ? 'text-primary' : ''}>
                            {obj.descripcion}
                        </span>
                        <Form.Field>
                            <input type="number"
                                step="any" 
                                value={obj.monto}
                                disabled={!obj.edit ? true : !this.props.edit}
                                onChange={({target}) => this.handleMonto(index, target.value, obj)}
                                min="0"
                            />
                        </Form.Field>
                    </div>
                )}
            </Form>
        )
    }

}