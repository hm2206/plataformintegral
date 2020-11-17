import React, { Component } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import moment from 'moment';
import { tipo_documento } from '../../services/storage.json';
import { unujobs } from '../../services/apis';
import { parseOptions } from '../../services/utils';
import Swal from 'sweetalert2';
import Show from '../../components/show';
import Router from 'next/router';

export default class General extends Component
{

    state = {
        loading: false,
        bancos: [],
        afps: [],
        work: {},
        person: {},
        edit: {
            work: false,
            person: false
        }
    }

    componentDidMount = async () => {
        await this.setting(this.props)
        await this.getBancos();
        await this.getLeySociales();
    }

    componentWillReceiveProps = async (nextProps) => {
        let { work, person } = this.props;
        if (work != nextProps.work || person != nextProps.person) {
            await this.setState({ work: {}, person: {} });
            this.setting(nextProps);
        }
    }

    setting = async (props) => {
        await this.setState({
            work: props.work,
            person: props.person
        });
    }

    handleInput = ({ name, value }, obj = 'work') => {
        let newObject = Object.assign({}, this.state[obj]);
        let newEdit = Object.assign({}, this.state.edit);
        newObject[name] = value;
        newEdit[obj] = true;
        this.setState({[obj]: newObject, edit: newEdit});
    }

    leaveForm = async (e, name) => {
        e.preventDefault();
        let answer = await Swal.fire({
            icon: 'warning',
            text: "¿Está seguro en cancelar la edición?",
            confirmButtonText: "Continuar",
            showCancelButton: true
        });
        // verify
        if (answer) {
            Router.push({ pathname: Router.pathname, query: Router.query })
            let newObj = Object.assign({}, this.state.loading);
            newObj[name] = false;
            this.setState({edit: newObj});
        }
    }

    getBancos = async () => {
        this.setState({ loading: true });
        await unujobs.get('banco')
        .then(res => this.setState({ bancos: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    getLeySociales = async () => {
        this.setState({ loading: true });
        await unujobs.get('afp')
        .then(res => this.setState({ afps: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    updateWork = async () => {
        this.setState({ loading: true });
        let form = Object.assign({}, this.state.work);
        form._method = 'PUT';
        await unujobs.post(`work/${this.state.work.id}`, form)
        .then(res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            Swal.fire({ icon, text: message });
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
        this.setState(state => ({ loading: false, edit: { work: false, person: state.edit.person } }));
    }

    render() {

        let { work, person, edit } = this.state;

        return (
            <Form loading={this.state.loading}>
                <div className="row">
                    <div className="col-md-12 mb-4">
                        <h4><i className="fas fa-info-circle"></i> Datos Generales del Trabajador</h4>
                    </div>

                    <div className="col-md-4">
                        <div>
                            <b><i className="fas fa-place"></i> Ubicación</b>
                            <hr/>
                        </div>
                        <iframe src={`https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d63151.44781604753!2d-74.58435273334369!3d-8.405050255752414!3m2!1i1024!2i768!4f13.1!2m1!1s${person && person.address}!5e0!3m2!1ses!2spe!4v1586299621785!5m2!1ses!2spe`} 
                            frameborder="0" 
                            style={{ border: "0px", width: "100%", height: "200px" }}
                            aria-hidden="false" 
                            tabindex="0"
                        />
                    </div>

                    <div className="col-md-8">
                        <b><i className="fas fa-user"></i> Datos Personales</b>
                        <hr/>
                        <div className="row">
                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Prefijo</label>
                                    <input type="text" value={person.profession} disabled={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Nombre Completo</label>
                                    <input type="text" value={person.fullname} disabled={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Tipo. Documento</label>
                                    <input type="text" value={person.document_type} disabled={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Documento</label>
                                    <input type="text" value={person.document_number} disabled={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Genero <b className="text-red">*</b></label>
                                    <Select placeholder="Select. Ubigeo" 
                                        value={person.gender}
                                        name="gender"
                                        onChange={(e, obj) => this.handleInput(obj, 'person')}
                                        options={[
                                            { key: "M", value: "M", text: "Masculino" },
                                            { key: "F", value: "F", text: "Femenino" },
                                            { key: "I", value: "I", text: "No Binario" }
                                        ]}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Fecha de Nacimiento</label>
                                    <input type="date" value={moment.utc(person.date_of_birth).format('YYYY-MM-DD')} disabled={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Ubigeo <b className="text-red">*</b></label>
                                    <Select placeholder="Select. Ubigeo"/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Dirección</label>
                                    <input type="text" 
                                        value={person.address}
                                        name="address"
                                        readOnly
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Telefono</label>
                                    <input type="tel" 
                                        value={person.phone ? person.phone : ''}
                                        name="phone"
                                        readOnly
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Correo de Contacto</label>
                                    <input type="email" 
                                        value={person.email_contact ? person.email_contact : ''}
                                        name="email_contact"
                                        readOnly
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-12 mb-4 mt-4 text-right col-6">
                                <hr/>
                            </div>

                            <div className="col-md-12">
                                <h4><i className="fas fa-file-alt"></i> Datos del Trabajador</h4>
                                <hr/>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Banco <b className="text-red">*</b></label>
                                    <Select
                                        options={parseOptions(this.state.bancos, ["select-banco", "", "Select. Banco"], ["id", "id", "nombre"])}
                                        value={work.banco_id}
                                        placeholder="Select. Banco"
                                        name="banco_id"
                                        onChange={(e, obj) => this.handleInput(obj, 'work')}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Cuenta</label>
                                    <input type="text" 
                                        value={work.numero_de_cuenta ? work.numero_de_cuenta : ''}
                                        name="numero_de_cuenta"
                                        onChange={(e) => this.handleInput(e.target, 'work')}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Ley Social <b className="text-red">*</b></label>
                                    <Select
                                        value={work.afp_id}
                                        options={parseOptions(this.state.afps, ["select-afp", "", "Select. Ley Social"], ["id", "id", "descripcion"])}
                                        placeholder="Select. Ley Social"
                                        name="afp_id"
                                        onChange={(e, obj) => this.handleInput(obj, 'work')}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Cussp</label>
                                    <input type="text" 
                                        value={work.numero_de_cussp ? work.numero_de_cussp : ''}
                                        name="numero_de_cussp"
                                        onChange={(e) => this.handleInput(e.target, 'work')}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Fecha de Afiliación</label>
                                    <input type="date" 
                                        value={work.fecha_de_afiliacion ? work.fecha_de_afiliacion : ''}
                                        name="fecha_de_afiliacion"
                                        onChange={(e) => this.handleInput(e.target, 'work')}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Essalud</label>
                                    <input type="text" 
                                        value={work.numero_de_essalud ? work.numero_de_essalud : ''}
                                        name="numero_de_essalud"
                                        onChange={(e) => this.handleInput(e.target, 'work')}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Prima Seguro</label>
                                    <Select
                                        options={[
                                            {key: "0", value: 0, text: "No Afecto"},
                                            {key: "1", value: 1, text: "Afecto"}
                                        ]}
                                        placeholder="Select. Prima Seguro"
                                        value={work.prima_seguro}
                                        name="prima_seguro"
                                        onChange={(e, obj) => this.handleInput(obj, 'work')}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-12 mt-4 text-right col-12">
                                <Show condicion={edit.work}>
                                    <div className="row">
                                        <div className="col-6">
                                            <Button color="red"
                                                fluid
                                                onClick={(e) => this.leaveForm(e, work)}
                                            >
                                                <i className="fas fa-trash-alt"></i> Cancelar Cambios
                                            </Button>
                                        </div>
                                        <div className="col-6">
                                            <Button color="teal"
                                                fluid
                                                onClick={this.updateWork}
                                            >
                                                <i className="fas fa-save"></i> Actualizar Información
                                            </Button>
                                        </div>
                                    </div>
                                </Show>
                                
                                <hr/>
                            </div>
                        </div>
                    </div>
                </div>
            </Form>
        );
    }

}