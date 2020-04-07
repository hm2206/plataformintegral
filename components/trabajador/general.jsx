import React, { Component } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import moment from 'moment';
import { tipo_documento } from '../../services/storage.json';
import { unujobs } from '../../services/apis';
import { parseOptions } from '../../services/utils';

export default class General extends Component
{

    state = {
        loading: false,
        bancos: [],
        afps: [],
    }

    componentDidMount = async () => {
        await this.getBancos();
        await this.getLeySociales();
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

    render() {

        let { work } = this.props;

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
                        <iframe src={`https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d63151.44781604753!2d-74.58435273334369!3d-8.405050255752414!3m2!1i1024!2i768!4f13.1!2m1!1s${work.person.address}!5e0!3m2!1ses!2spe!4v1586299621785!5m2!1ses!2spe`} 
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
                                    <input type="text" value={work.person.profession} disabled={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Nombre Completo</label>
                                    <input type="text" value={work.person.fullname} disabled={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Tipo. Documento</label>
                                    <Select placeholder="Select. Tip. Documento"
                                        value={work.person.document_type}
                                        options={tipo_documento}
                                        disabled={true}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Documento</label>
                                    <input type="text" value={work.person.document_number} disabled={true}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Genero <b className="text-red">*</b></label>
                                    <Select placeholder="Select. Ubigeo" 
                                        value={work.person.gender}
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
                                    <input type="date" value={moment.utc(work.person.date_of_birth).format('YYYY-MM-DD')} disabled={true}/>
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
                                    <input type="text" value={work.person.address}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Telefono</label>
                                    <input type="tel" value={work.person.phone}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Correo de Contacto</label>
                                    <input type="email" value={work.person.email_contact}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-12 mb-4 mt-4 text-right">
                                <Button color="teal">
                                    <i className="fas fa-save"></i> Actualizar Información
                                </Button>
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
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Cuenta</label>
                                    <input type="text" value={work.numero_de_cuenta}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Ley Social <b className="text-red">*</b></label>
                                    <Select
                                        value={work.afp_id}
                                        options={parseOptions(this.state.afps, ["select-afp", "", "Select. Ley Social"], ["id", "id", "descripcion"])}
                                        placeholder="Select. Ley Social"
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Cussp</label>
                                    <input type="text" value={work.numero_de_cussp}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Fecha de Afiliación</label>
                                    <input type="date" value={work.fecha_de_Afiliacion}/>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mb-2">
                                <Form.Field>
                                    <label htmlFor="">N° Essalud</label>
                                    <input type="text" value={work.numero_de_essalud}/>
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
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-12 mt-4 text-right">
                                <Button color="teal">
                                    <i className="fas fa-save"></i> Actualizar Información
                                </Button>
                                <hr/>
                            </div>
                        </div>
                    </div>
                </div>
            </Form>
        );
    }

}