import React, { Component, Fragment } from 'react';
import { authentication } from '../../services/apis';
import { Form, Button, Select, Message } from 'semantic-ui-react';
import { parseOptions } from '../../services/utils';
import Show from '../show';
import Swal from 'sweetalert2';
import moment from 'moment';


export default class Work extends Component {

    state = {
        history: {},
        work: {},
        error: "",
        provincias: [],
        distritos: []
    };


    componentDidMount = async () => {
        await this.setting(this.props);
        this.getDistritos();
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.edit != this.props.edit || nextProps.historial != this.props.historial) {
            this.setting(nextProps);
        }   
        // update send
        if (nextProps.send == true && nextProps.send != this.props.send) {
            
        }
        // ubigeos
        if (this.props.ubigeos != nextProps.ubigeos) this.handleDepartamento(this.state.work.cod_dep);
    }

    componentDidUpdate = (nextProps, nextState) => {
        let  { work } = this.state;
        // handledepartamentos
        if (work && work.cod_dep != nextState.work.cod_dep) this.handleDepartamento(work.cod_dep);
        if (work && work.cod_pro != nextState.work.cod_pro) {
            this.getDistritos();
        }
    }

    getDistritos = async () => {
        let { work } = this.state;
        await authentication.get(`get_distritos/${work.cod_dep}/${work.cod_pro}`)
        .then(res => this.setState({ distritos: res.data }))
        .catch(err => console.log(err.message));
    }
 
    setting = async (nextProps) => {
        let { person } = nextProps.historial || {};
        person.cod_dep = person.badge_id.substr(0, 2);
        person.cod_pro = person.badge_id.substr(2, 2);
        person.cod_dis = person.badge_id.substr(4, 2);
        await this.setState({ 
            history: nextProps.historial ? nextProps.historial : {}, 
            work: person
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

    handleDepartamento = async (cod_dep) => {
        await this.setState({ provincias: [] });
        await this.setState((state, props) => {
            for(let ubi of props.ubigeos) {
                if (ubi.cod_dep == cod_dep) {
                    state.provincias = ubi.provincias;
                    // response
                    return { provincias: state.provincias };
                }
            }
        });
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
                        <div className="col-md-3 mb-3">
                            <Form.Field>
                                <b>Apellido Paterno</b>
                                <input type="text" 
                                    name="ape_pat"
                                    defaultValue={work.ape_pat}
                                    disabled={true}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-3">
                            <Form.Field>
                                <b>Apellido Materno</b>
                                <input type="text" 
                                    name="ape_mat"
                                    defaultValue={work.ape_mat}
                                    disabled={true}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-3">
                            <Form.Field>
                                <b>Nombres</b>
                                <input type="text" 
                                    name="name"
                                    defaultValue={work.name}
                                    disabled={true}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-3">
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
                        </div>

                        <div className="col-md-3 mb-3">
                            <Form.Field>
                                <b>Tipo Documento</b>
                                <Select
                                    options={this.props.type_documents}
                                    value={work.document_type ? work.document_type : ''}
                                    disabled
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-3">
                            <Form.Field>
                                <b>N° Documento</b>
                                <input type="text" 
                                    name="document_number"
                                    value={work.document_number || ''}
                                    disabled={true}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-3">
                            <Form.Field>
                                <b>Fecha de Nacimiento</b>
                                <b className="ml-1 badge badge-warning mb-1">{moment(work.date_of_birth, "YYYY/MM/DD").fromNow()}</b>
                                <input type="date" 
                                    name="date_of_birth"
                                    value={work.date_of_birth || ''}
                                    disabled={true}
                                    onChange={this.handleInput}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-3">
                            <Form.Field>
                                <b>Profesión Abrev.</b>
                                <input type="text"
                                    name="profession"
                                    value={work.profession || ''}
                                    disabled={!this.props.edit}
                                    onChange={this.handleInput}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-3">
                            <Form.Field>
                                <b>Departamento</b>
                                <select name="cod_dep"
                                    disabled={!this.props.edit}
                                    value={work.cod_dep || ""}
                                    onChange={this.handleInput}
                                >
                                    <option value="">Select. Departamento</option>
                                    {this.props.ubigeos.map(obj => 
                                        <option value={obj.cod_dep} key={`departamento-${obj.cod_dep}`}>
                                            {obj.departamento}
                                        </option>    
                                    )}
                                </select>
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-3">
                            <Form.Field>
                                <b>Provincia</b>
                                <select name="cod_pro"
                                    disabled={!this.props.edit || !work.cod_dep}
                                    value={work.cod_pro || ""}
                                    onChange={this.handleInput}
                                >
                                    <option value="">Select. Provincia</option>
                                    {this.state.provincias.map(obj => 
                                        <option value={obj.cod_pro} key={`prov-${obj.cod_pro}`}>
                                            {obj.provincia}
                                        </option>    
                                    )}
                                </select>
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-3">
                            <Form.Field>
                                <b>Distrito</b>
                                <select name="cod_dis"
                                    disabled={!this.props.edit || !work.cod_pro}
                                    value={work.cod_dis || ""}
                                    onChange={this.handleInput}
                                >
                                    <option value="">Select. Distrito</option>
                                    {this.state.distritos.map(obj => 
                                        <option value={obj.cod_dis} key={`dist-${obj.cod_dis}`}>
                                            {obj.distrito}
                                        </option>    
                                    )}
                                </select>
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-3">
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
                        
                        <div className="col-md-3 mb-3">
                            <Form.Field>
                                <b>Correo Electrónico</b>
                                <input type="text" 
                                    name="email_contact"
                                    value={work.email_contact || ''}
                                    disabled={!this.props.edit}
                                    onChange={this.handleInput}
                                    placeholder="ejemplo@mail.com"
                                    autoComplete="off"
                                />
                            </Form.Field> 
                        </div>
                        
                        <div className="col-md-3 mb-3">
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