import React, { Component, Fragment } from 'react';
import { unujobs } from '../../services/apis';
import { Form, Button, Select, Message } from 'semantic-ui-react';
import { parseOptions } from '../../services/utils';
import Show from '../show';
import Swal from 'sweetalert2';
import moment from 'moment';


export default class Work extends Component {

    state = {
        history: {},
        work: {},
        error: ""
    };


    componentDidMount() {
        this.setting(this.props);
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.edit != this.props.edit || nextProps.historial != this.props.historial) {
            this.setting(nextProps);
        }   
        // update send
        if (nextProps.send == true && nextProps.send != this.props.send) {
            
        }
    }

    setting = async (nextProps) => {
        await this.setState({ 
            history: nextProps.historial ? nextProps.historial : {}, 
            work: nextProps.historial.person ? nextProps.historial.person : {} 
        });
    }


    handleInput = (e) => {
        let { name, value } = e.target;
        let newWork = Object.assign({}, this.state.work);
        newWork[name] = value;
        this.setState({ work: newWork });
    }

    handleSelect = async (e, { name, value }) => {
        let newWork = await Object.assign({}, this.state.work);
        newWork[name] = value;
        this.setState({ work: newWork });
    }

    render() {

        let { work, error } = this.state;

        return (
            <Fragment>

                <Show condicion={error}>
                    <Message color="red">
                        Error: { error }
                    </Message>
                </Show>

                <Show condicion={this.props.total}>
                    <div className="row">
                        <div className="col-md-3">
                            <Form.Field>
                                <b>Apellido Paterno</b>
                                <input type="text" 
                                    name="ape_pat"
                                    defaultValue={work.ape_pat}
                                    disabled={true}
                                />
                            </Form.Field>

                            <Form.Field>
                                <b>Tipo Documento</b>
                                <Select
                                    options={this.props.type_documents}
                                    value={work.document_type ? work.document_type : ''}
                                    disabled
                                />
                            </Form.Field>

                            <Form.Field>
                                <b>Ubigeo</b>
                                <select name="badge_id"
                                    disabled={!this.props.edit}
                                    value={work.badge_id}
                                    onChange={this.handleInput}
                                >
                                    <option value="">Select. Ubigeo</option>
                                    {this.props.ubigeos.map(obj => 
                                        <option value={obj.id} key={`ubigeo-${obj.id}`}>
                                            {obj.departamento} | {obj.provincia} | {obj.distrito}
                                        </option>    
                                    )}
                                </select>
                            </Form.Field>
                        </div>

                        <div className="col-md-3">
                            <Form.Field>
                                <b>Apellido Materno</b>
                                <input type="text" 
                                    name="ape_mat"
                                    defaultValue={work.ape_mat}
                                    disabled={true}
                                />
                            </Form.Field>

                            <Form.Field>
                                <b>N° Documento</b>
                                <input type="text" 
                                    name="document_number"
                                    defaultValue={work.document_number}
                                    disabled={true}
                                />
                            </Form.Field>

                            <Form.Field>
                                <b>Dirección</b>
                                <input type="text" 
                                    name="address"
                                    value={work.address ? work.address : ''}
                                    disabled={!this.props.edit}
                                    onChange={this.handleInput}
                                />
                            </Form.Field>          
                        </div>

                        <div className="col-md-3">
                            <Form.Field>
                                <b>Nombres</b>
                                <input type="text" 
                                    name="name"
                                    defaultValue={work.name}
                                    disabled={true}
                                />
                            </Form.Field>

                            <Form.Field>
                                <b>Fecha de Nacimiento</b>
                                <input type="date" 
                                    name="date_of_birth"
                                    value={work.date_of_birth}
                                    disabled={true}
                                    onChange={this.handleInput}
                                />
                            </Form.Field>

                            <Form.Field>
                                <b>Correo Electrónico</b>
                                <input type="text" 
                                    name="email_contact"
                                    value={work.email_contact ? work.email_contact : ''}
                                    disabled={!this.props.edit}
                                    onChange={this.handleInput}
                                />
                            </Form.Field> 
                        </div>

                        <div className="col-md-3">
                            <Form.Field>
                                <b>Profesión Abrev.</b>
                                <input type="text"
                                    name="profession"
                                    value={work.profession ? work.profession : ''}
                                    disabled={!this.props.edit}
                                    onChange={this.handleInput}
                                />
                            </Form.Field>

                            <Form.Field>
                                <b>Género</b>
                                <Select placeholder="Select. Género"
                                    options={[
                                        {key: "t", value: "", text: "Select. Género"},
                                        {key: "m", value: "M", text: "Masculino"},
                                        {key: "f", value: "F", text: "Femenino"},
                                        {key: "i", value: "I", text: "No Binario"}
                                    ]}
                                    name="gender"
                                    value={work.gender}
                                    onChange={this.handleSelect}
                                    disabled={true}
                                />
                            </Form.Field>

                            <Form.Field>
                                <b>N° Teléfono</b>
                                <input type="text"  
                                    name="phone"
                                    value={work.phone ? work.phone : ""}
                                    disabled={!this.props.edit}
                                    onChange={this.handleInput}
                                />
                            </Form.Field>  
                        </div>
                    </div>
                </Show>
            </Fragment>
        );
    }

}