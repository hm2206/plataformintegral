import React, { Component, Fragment } from 'react'
import Modal from '../../../components/modal';
import { Form, Image, Select, Button } from 'semantic-ui-react';
import Router from 'next/router';
import ConsultaIframe from '../../../components/consultaIframe';
import { authentication, unujobs } from '../../../services/apis';
import { parseOptions } from '../../../services/utils';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';

export default class Create extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        return { query: ctx.query, pathname: ctx.pathname }
    }

    state = {
        loader: false,
        block: false,
        path: "",
        form: {
            name: "",
            ape_pat: "",
            ape_mat: "",
            gender: "",
            date_of_birth: "",
            address: 'S/D',
            phone: ''
        },
        work: {},
        image_render: "/img/base.png",
        image: null,
        ssp: 'none',
        essalud: 'none',
        document_types: [],
        departamentos: [],
        provincias: [],
        distritos: [],
        afps: []
    }

    componentDidMount = () => {
        let tmp = this.props.pathname.split('/');
        tmp.pop();
        this.setState({ path: tmp.join('/') });
        // apis
        this.getDocumentType();
        this.getDepartamento();
        this.getAFPs();
    }

    componentWillUpdate = async (nextProps, nextState) => {
        let { form, works } = this.state;
        if (nextState.form.departamento_id && form.departamento_id != nextState.form.departamento_id) {
            await this.getProvincias(nextState.form);
        } else if (nextState.form.provincia_id && form.provincia_id != nextState.form.provincia_id) {
            await this.getDistritos(nextState.form);
        }
    }

    handleImage = ({ name, value, files }) => {
        let archivo = files[0];
        let reader = new FileReader();
        if (archivo) {
            this.setState({ image: archivo });
            reader.readAsDataURL(archivo);
            reader.onloadend = () => {
                this.setState({ image_render: reader.result });
            }
        }
    }

    handleInput = async ({ name, value }, object = 'form') => {
        let newObj = Object.assign({}, this.state[object]);
        newObj[name] = value;
        await this.setState({ [object]: newObj });
        // validar reniec
        if (name == 'document_type' && value == '01') {
            let message = "Listo para ser validado!"
            let newObj = Object.assign({}, this.state.form);
            newObj['document_type'] = '01';
            newObj['name'] = message;
            newObj['ape_pat'] = message;
            newObj['ape_mat'] = message;
            this.setState({ form: newObj, block: true });
        } else if (name == 'document_type' && value != '01') {
            this.setState({ block: false });
        }
    }

    getDocumentType = async () => {
        await authentication.get('get_document_type')
        .then(res => this.setState({ document_types: res.data }))
        .catch(err => console.log(err.message));
    }

    getDepartamento = async () => {
        await authentication.get('get_departamentos')
        .then(res => this.setState({ departamentos: res.data }))
        .catch(err => console.log(err.message));
    }

    getProvincias = async (form) => {
        await authentication.get(`get_provincias/${form.departamento_id}`)
        .then(res => this.setState({ provincias: res.data }))
        .catch(err => console.log(err.message));
        let obj = Object.assign({}, this.state.form);
        obj['provincia_id'] = "";
        obj['distrito_id'] = "";
        this.setState({ form: obj });
    }

    getDistritos = async (form) => {
        await authentication.get(`get_distritos/${form.departamento_id}/${form.provincia_id}`)
        .then(res => this.setState({ distritos: res.data }))
        .catch(err => console.log(err.message));
        let obj = Object.assign({}, this.state.form);
        obj['distrito_id'] = "";
        this.setState({ form: obj });
    }

    getAFPs = async () => {
        await unujobs.get('afp')
        .then(res => this.setState({ afps: res.data }))
        .catch(err => console.log(err.message));
    }

    create = async () => {
        this.setState({ loader: true });
        let form = new FormData;
        // generate work
        for(let key in this.state.work) {
            form.append(key, this.state.work[key]);
        }
        // append
        form.append('person', JSON.stringify(this.state.form));
        form.append('image', this.state.image);
        await unujobs.post('work', form)
        .then(async res => {
            let { success, message, body } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) {
                let id = await btoa(body);
                let newPath = await Router.pathname.split('/');
                newPath[newPath.length - 1] = id;
                Router.push({ pathname: newPath.join('/') });
            }
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }))
        this.setState({ loader: false });
    }

    render() {    

        let { image_render, form, path, work, document_types } = this.state;

            return (
                <Fragment>
                    <Modal
                        md="9"
                        titulo={<span><i className="fas fa-user-plus"></i> Agregar un nuevo trabajador</span>}
                        show={true}
                        isClose={(e) => Router.push({ pathname: path })}
                        disabled={this.state.loader}
                    >   
                        <Form className="card-body" loading={this.state.loader}>
                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    ( <b className="text-red">*</b> ) Campos obligatorios
                                    <hr/>
                                </div>
    
                                <div className="col-md-12 mb-3">
                                    <div className="row justify-content-center">
                                        <Image circular src={image_render} 
                                            size="small"
                                            style={{ width: "150px", height: "150px", objectFit: "contain" }}
                                        />
                                        <div className="col-md-12 text-center">
                                            <label htmlFor="image" className="text-primary" 
                                                style={{ cursor: "pointer" }}
                                                title="Agregar foto personal"
                                            >
                                                <b><i className="fas fa-image"></i> Seleccinar Foto Personal</b>
                                                <input type="file" 
                                                    accept="image/png" 
                                                    hidden id="image"
                                                    onChange={(e) => this.handleImage(e.target)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
    
                                <div className="col-md-4">
                                    <Form.Field>
                                        <label htmlFor="">Tipo Documento <b className="text-red">*</b></label>
                                        <Select
                                            placeholder="Select. Tipo Documento"
                                            name="document_type"
                                            options={this.state.document_types}
                                            onChange={(e, obj) => this.handleInput(obj)}
                                            value={form.document_type ? form.document_type : ''}
                                        />
                                    </Form.Field>
    
                                    <Show condicion={!this.state.block}>
                                        <Form.Field>
                                            <label htmlFor="">Apellido Paterno <b className="text-red">*</b></label>
                                            <input type="text"
                                                disabled={this.state.block}
                                                name="ape_pat"
                                                value={form.ape_pat ? form.ape_pat : ''}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                        </Form.Field>
        
                                        <Form.Field>
                                            <label htmlFor="">Fecha de Nacimiento <b className="text-red">*</b></label>
                                            <input type="date"
                                                disabled={this.state.block}
                                                name="date_of_birth"
                                                value={form.date_of_birth ? form.date_of_birth : ''}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                        </Form.Field>
                                    </Show>
    
                                    <Form.Field>
                                        <label htmlFor="">Departamento <b className="text-red">*</b></label>
                                        <select name="departamento_id"
                                            value={form.departamento_id ? form.departamento_id : ''}
                                            onChange={(e) => this.handleInput(e.target)}
                                        >
                                            <option value="">Select. Departamento</option>
                                            {this.state.departamentos.map(obj => 
                                                <option value={obj.cod_dep} key={`dep-${obj.departamento}`}>{obj.departamento}</option>
                                            )}
                                        </select>
                                    </Form.Field>
    
                                    <Form.Field>
                                        <label htmlFor="">Teléfono</label>
                                        <input type="text"
                                            name="phone"
                                            value={form.phone ? form.phone : ''}
                                            onChange={(e) => this.handleInput(e.target)}
                                        />
                                    </Form.Field>
                                </div>
    
                                <div className="col-md-4">
                                    <Form.Field>
                                        <label htmlFor="">N° Documento <b className="text-red">*</b></label>
                                        <input type="text"
                                            name="document_number"
                                            value={form.document_number ? form.document_number : ''}
                                            onChange={(e) => this.handleInput(e.target)}
                                        />
                                    </Form.Field>
    
                                    <Show condicion={!this.state.block}>
                                        <Form.Field>
                                            <label htmlFor="">Apellido Materno <b className="text-red">*</b></label>
                                            <input type="text"
                                                disabled={this.state.block}
                                                name="ape_mat"
                                                value={form.ape_mat ? form.ape_mat : ''}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                        </Form.Field>
        
                                        <Form.Field>
                                            <label htmlFor="">Genero <b className="text-red">*</b></label>
                                            <Select
                                                disabled={this.state.block}
                                                placeholder="Select. Genero"
                                                options={[
                                                    { key: "M", value: "M", text: "Masculino" },
                                                    { key: "F", value: "F", text: "Femenino" },
                                                    { key: "I", value: "I", text: "No Binario" }
                                                ]}
                                            />
                                        </Form.Field>
                                    </Show>
    
                                    <Form.Field>
                                        <label htmlFor="">Provincias <b className="text-red">*</b></label>
                                        <select
                                            name="provincia_id"
                                            value={form.provincia_id ? form.provincia_id : ''}
                                            onChange={(e) => this.handleInput(e.target)}
                                            disabled={!form.departamento_id}
                                        >
                                            <option value="">Select. Provincia</option>
                                            {this.state.provincias.map(obj =>
                                                <option key={`prov-${obj.pro}`} value={obj.cod_pro}>{obj.provincia}</option>    
                                            )}
                                        </select>
                                    </Form.Field>
    
                                    <Form.Field>
                                        <label htmlFor="">Estado Cívil <b className="text-red">*</b></label>
                                        <select
                                            name="marital_status"
                                            value={form.marital_status ? form.marital_status : ''}
                                            onChange={(e) => this.handleInput(e.target)}
                                        >
                                            <option value="">Select. Estado Cívil</option>
                                            <option value="S">Soltero(a)</option>
                                            <option value="C">Casado(a)</option>
                                            <option value="D">Divorsiado(a)</option>
                                            <option value="V">Viudo(a)</option>
                                        </select>
                                    </Form.Field>
                                </div>
    
                                <div className="col-md-4">
                                    <Show condicion={!this.state.block}>
                                        <Form.Field>
                                            <label htmlFor="">Nombres <b className="text-red">*</b></label>
                                            <input type="text"
                                                disabled={this.state.block}
                                                name="name"
                                                value={form.name ? form.name : ''}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                        </Form.Field>
                                    </Show>
    
                                    <Form.Field>
                                        <label htmlFor="">Profesión <b className="text-red">*</b></label>
                                        <input type="text"
                                            name="profession"
                                            value={form.profession ? form.profession : ''}
                                            onChange={(e) => this.handleInput(e.target)}
                                        />
                                    </Form.Field>
    
                                    <Show condicion={!this.state.block}>
                                        <Form.Field>
                                            <label htmlFor="">Dirección <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="address"
                                                value={form.address ? form.address : ''}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                        </Form.Field>
                                    </Show>
    
                                    <Form.Field>
                                        <label htmlFor="">Distrito <b className="text-red">*</b></label>
                                        <select
                                            name="distrito_id"
                                            value={form.distrito_id ? form.distrito_id : ''}
                                            onChange={(e) => this.handleInput(e.target)}
                                            disabled={!form.provincia_id}
                                        >
                                            <option value="">Select. Distrito</option>
                                            {this.state.distritos.map(obj =>
                                                <option key={`dis-${obj.dis}`} value={obj.cod_dis}>{obj.distrito}</option>    
                                            )}
                                        </select>
                                    </Form.Field>
    
                                    <Form.Field>
                                        <label htmlFor="">Correo de Contacto</label>
                                        <input type="text"
                                            name="email_contact"
                                            value={form.email_contact ? form.email_contact : ''}
                                            onChange={(e) => this.handleInput(e.target)}
                                        />
                                    </Form.Field>
                                </div>
    
                                <div className="col-md-12">
                                    <hr/>
                                    <i className="fas fa-cogs"></i> Configuración del Trabajador
                                    <hr/>
                                </div>
                                
                                <div className="col-md-4">
                                    <Form.Field>
                                        <label htmlFor="">Tip. Banco <b className="text-red">*</b></label>
                                        <input type="text"
                                            defaultValue="B NACIÓN"
                                            disabled
                                        />
                                    </Form.Field>
    
                                    <Form.Field>
                                        <label htmlFor="">Ley Social <b className="text-red">*</b></label>
                                        <select name="afp_id"
                                            value={work.afp_id ? work.afp_id : ''}
                                            onChange={(e) => this.handleInput(e.target, 'work')}
                                        >
                                            <option value="">Select. Ley Social</option>
                                            {this.state.afps.map(obj => 
                                                <option value={obj.id} key={`afp-${obj.id}`}>{obj.descripcion}</option>    
                                            )}
                                        </select>
                                    </Form.Field>
    
                                    <Form.Field>
                                        <label htmlFor="">Prima Seguro <b className="text-red">*</b></label>
                                        <select name="prima_seguro"
                                            value={work.prima_seguro ? work.prima_seguro : ''}
                                            onChange={(e) => this.handleInput(e.target, 'work')}
                                        >
                                            <option value="">No afecto</option>
                                            <option value="1">Afecto</option>
                                        </select>
                                    </Form.Field>
                                </div>
    
                                <div className="col-md-4">
                                    <Form.Field>
                                        <label htmlFor="">N° Cuenta</label>
                                        <input type="text"
                                            name="numero_de_cuenta"
                                            value={work.numero_de_cuenta ? work.numero_de_cuenta : ''}
                                            onChange={(e) => this.handleInput(e.target, 'work')}
                                        />
                                    </Form.Field>
    
                                    <Form.Field>
                                        <label htmlFor="">N° Cussp</label>
                                        <input type="text"
                                            name="numero_de_cussp"
                                            value={work.numero_de_cussp ? work.numero_de_cussp : ''}
                                            onChange={(e) => this.handleInput(e.target, 'work')}
                                        />
                                    </Form.Field>
    
                                    <Form.Field>
                                        <label htmlFor="">Consulta SSP</label>
                                        <Button color="orange" basic fluid
                                            onClick={(e) => this.setState({ ssp: true })}
                                        >
                                            Realizar consulta
                                        </Button>
                                    </Form.Field>
                                </div>
    
                                <div className="col-md-4">
                                    <Form.Field>
                                        <label htmlFor="">N° Essalud</label>
                                        <input type="text"
                                            name="numero_de_essalud"
                                            value={work.numero_de_essalud ? work.numero_de_essalud : ''}
                                            onChange={(e) => this.handleInput(e.target, 'work')}
                                        />
                                    </Form.Field>
    
                                    <Form.Field>
                                        <label htmlFor="">Fecha de Afiliación</label>
                                        <input type="date"
                                            name="fecha_de_afiliacion"
                                            value={work.fecha_de_afiliacion ? work.fecha_de_afiliacion : ''}
                                            onChange={(e) => this.handleInput(e.target, 'work')}
                                        />
                                    </Form.Field>
    
                                    <Form.Field>
                                        <label htmlFor="">Consulta Essalud</label>
                                        <Button color="orange" fluid basic
                                            onClick={(e) => this.setState({ essalud: true })}
                                        >
                                            Realizar consulta
                                        </Button>
                                    </Form.Field>
                                </div>
    
                                <div className="col-md-12 text-right">
                                    <hr/>
                                    <Button color="teal"
                                        onClick={this.create}
                                    >
                                        <i className="fas fa-save"></i> Guardar y Continuar
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </Modal>
    
    
                    <ConsultaIframe 
                        isClose={(e) => this.setState({ ssp: 'none' })}
                        display={this.state.ssp}
                        titulo="Consulta al Sistema Privado de Pensiones"
                        url="https://www2.sbs.gob.pe/afiliados/paginas/Consulta.aspx"
                    />
    
                    <ConsultaIframe 
                        isClose={(e) => this.setState({ essalud: 'none' })}
                        md="8"
                        display={this.state.essalud}
                        titulo="Consulta al Sistema de  Essalud"
                        url="http://ww4.essalud.gob.pe:7777/acredita/"
                    />
                </Fragment>
            )
        }
}