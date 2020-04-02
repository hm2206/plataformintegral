import React, { Component } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Select, Icon } from 'semantic-ui-react';
import { parseOptions } from '../../services/utils';


export default class Remuneracion extends Component
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
                        <div className="col-md-5">
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
                        <div className="col-xs">
                            <Button color="green"
                                disabled={!type_aportacion_id}    
                            >
                                <Icon name="plus"/> Agregar
                            </Button>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-12">
                    <hr/>
                </div>

                {aportaciones.map((obj, index) => 
                    <div  key={`remuneracion-${obj.id}`}
                         className="col-md-3 mb-1"
                    >
                        <span className="text-danger">
                            {obj.key}
                        </span>
                            .-
                        <span className="text-primary">
                            {obj.descripcion}
                        </span>
                        <Form.Field>
                            <input type="number"
                                step="any" 
                                defaultValue={obj.monto}
                                disabled={!this.props.edit}
                                onChange={({target}) => this.handleMonto(obj.id, target.value, index)}
                                min="0"
                            />
                        </Form.Field>
                    </div>
                )}
            </Form>
        )
    }

}