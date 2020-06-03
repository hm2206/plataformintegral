import React, { Component, Fragment } from 'react'
import { Form, Image, Select, Button } from 'semantic-ui-react';
import Router from 'next/router';
import { authentication, unujobs } from '../../../services/apis';
import { parseOptions, backUrl, parseUrl } from '../../../services/utils';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import btoa from 'btoa'

export default class CreateTrabajador extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname, store } = ctx;
        return { query, pathname }
    }

    state = {
        loader: false,
        block: false,
        form: {
            name: "",
            ape_pat: "",
            ape_mat: "",
            document_type: "",
            document_number: "",
            gender: "",
            date_of_birth: "",
            address: 'S/D',
            phone: '',
            cod_dep: "",
            cod_pro: "",
            cod_dis: ""
        },
        image_render: "/img/base.png",
        image: null,
        document_types: [],
        departamentos: [],
        provincias: [],
        distritos: [],
        errors: {}
    }

    componentDidMount = () => {
        // apis
        this.getDocumentType();
        this.getDepartamento();
    }

    componentWillUpdate = async (nextProps, nextState) => {
        let { form, works } = this.state;
        if (nextState.form.cod_dep && form.cod_dep != nextState.form.cod_dep) {
            await this.getProvincias(nextState.form);
        } else if (nextState.form.cod_pro && form.cod_pro != nextState.form.cod_pro) {
            await this.getDistritos(nextState.form);
        }

        if (nextState.form.document_number != form.document_number) {
            await this.getReniec(nextState.form.document_number);
        }
    }

    handleBack = () => {
        let { pathname, query, push } = Router;
        this.setState({ loader: true });
        if (query.href) {
            push(query.href);
        } else {
            push({ pathname: backUrl(pathname) });
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
        let newErrors = Object.assign({}, this.state.errors);
        newObj[name] = value;
        newErrors[name] = "";
        await this.setState({ [object]: newObj, errors: newErrors });
    }

    getReniec = async (dni = "") => {
        if (dni.length == 8) {
            this.setState({ loader: true });
            await unujobs.get(`reniec/${dni}`)
            .then(res => {
                let { success, result, message } = res.data;
                if (success) {
                    let newForm = Object.assign({}, this.state.form);
                    newForm.name = result.nombre;
                    newForm.ape_pat = result.paterno;
                    newForm.ape_mat = result.materno;
                    newForm.date_of_birth = result.nacimiento_parse;
                    newForm.gender = result.sexo ? 'M' : 'F';
                    this.setState({ form: newForm });
                } else {
                    Swal.fire({ icon: 'warning', text: message });
                }
            }).catch(err => Swal.fire({ icon: "error", text: "Algo salió mal al consultar a reniec" }));
            this.setState({ loader: false });
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
        await authentication.get(`get_provincias/${form.cod_dep}`)
        .then(res => this.setState({ provincias: res.data }))
        .catch(err => console.log(err.message));
        let obj = Object.assign({}, this.state.form);
        obj['cod_pro'] = "";
        obj['cod_dis'] = "";
        this.setState({ form: obj });
    }

    getDistritos = async (form) => {
        await authentication.get(`get_distritos/${form.cod_dep}/${form.cod_pro}`)
        .then(res => this.setState({ distritos: res.data }))
        .catch(err => console.log(err.message));
        let obj = Object.assign({}, this.state.form);
        obj['cod_dis'] = "";
        this.setState({ form: obj });
    }

    create = async () => {
        this.setState({ loader: true });
        const form = new FormData;
        for(let key in this.state.form) {
            await form.append(key, this.state.form[key]);
        }
        // add imagen
        form.append('image', this.state.image);
        // request
        await authentication.post(`create_person`, form)
        .then(async res => {
            let { success, message, person } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) {
                let id = btoa(person.id)
                await Router.push({ pathname: parseUrl(Router.pathname, "add"), query: { id } });
            }
        }).catch(err => {
            try {
                let { message } = err.response.data.error || "";
                let newErrors = JSON.parse(message);
                this.setState({ errors: newErrors.errors || {} });
            } catch (error) { Swal.fire({ icon: 'error', text: 'Algo salió mal' })}
        });
        this.setState({ loader: false });
    }

    onExist = async () => {
        let id = await prompt(`Porfavor ingrese su N° de Documento`);
        if (id) {
            this.setState({ loader: true });
            let { pathname, push } = Router;
            push({ pathname: parseUrl(pathname, 'add'), query: { id: btoa(id), type: 'document' } });
        }
    }

    render() {    

        let { image_render, form, errors } = this.state;
        let { query } = this.props;

            return (
                <Fragment>
                    <div className="col-md-12">
                        <Body>
                            <div className="card-header">
                                <BtnBack onClick={this.handleBack}/> <span className="ml-3"><i className="fas fa-plus"></i> Agregar Nueva Persona</span>
                            </div>

                            <div className="card-body">
                                <Form loading={this.state.loader}>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
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

                                        <div className="col-md-8">
                                            <div className="row">
                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors && errors.document_type && errors.document_type[0]}>
                                                        <label>Tipo Documento <b className="text-red">*</b></label>
                                                        <Select
                                                            placeholder="Select. Tipo Documento"
                                                            name="document_type"
                                                            options={this.state.document_types}
                                                            onChange={(e, obj) => this.handleInput(obj)}
                                                            value={form.document_type || ''}
                                                        />
                                                        <label htmlFor="">{errors && errors.document_type && errors.document_type[0]}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors && errors.document_number && errors.document_number[0]}>
                                                        <label htmlFor="">N° Documento <b className="text-red">*</b></label>
                                                        <input type="text"
                                                            name="document_number"
                                                            value={form.document_number || ''}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                        />
                                                        <label>{errors && errors.document_number && errors.document_number[0]}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors && errors.ape_pat && errors.ape_pat[0]}>
                                                        <label htmlFor="">Apellido Paterno <b className="text-red">*</b></label>
                                                        <input type="text"
                                                            disabled={this.state.block}
                                                            name="ape_pat"
                                                            value={form.ape_pat || ''}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                        />
                                                        <label>{errors && errors.ape_pat && errors.ape_pat[0]}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field error={errors && errors.ape_mat && errors.ape_mat[0]}>
                                                        <label htmlFor="">Apellido Materno <b className="text-red">*</b></label>
                                                        <input type="text"
                                                            disabled={this.state.block}
                                                            name="ape_mat"
                                                            value={form.ape_mat || ''}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                        />
                                                        <label>{errors && errors.ape_mat && errors.ape_mat[0]}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors && errors.name && errors.name[0]}>
                                                        <label htmlFor="">Nombres <b className="text-red">*</b></label>
                                                        <input type="text"
                                                            disabled={this.state.block}
                                                            name="name"
                                                            value={form.name || ''}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                        />
                                                        <label>{errors && errors.name && errors.name[0]}</label>
                                                    </Form.Field>
                                                </div>
                                                
                                                <div className="col-md-4">
                                                    <Form.Field error={errors && errors.gender && errors.gender[0]}>
                                                        <label htmlFor="">Genero <b className="text-red">*</b></label>
                                                        <Select
                                                            placeholder="Select. Genero"
                                                            name="gender"
                                                            value={this.state.form.gender || 'I'}
                                                            options={[
                                                                { key: "M", value: "M", text: "Masculino" },
                                                                { key: "F", value: "F", text: "Femenino" },
                                                                { key: "I", value: "I", text: "No Binario" }
                                                            ]}
                                                            onChange={(e, obj) => this.handleInput(obj)}
                                                        />
                                                        <label>{errors && errors.gender && errors.gender[0]}</label>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field error={errors && errors.profession && errors.profession[0]}>
                                                        <label htmlFor="">Prefesion Abr. <b className="text-red">*</b></label>
                                                        <input type="text"
                                                            name="profession"
                                                            value={form.profession || ''}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                        />
                                                        <label>{errors && errors.profession && errors.profession[0]}</label>
                                                    </Form.Field>
                                                </div>
                    
                                                <div className="col-md-4">
                                                    <Form.Field error={errors && errors.marital_status && errors.marital_status[0]}>
                                                        <label htmlFor="">Estado Cívil <b className="text-red">*</b></label>
                                                        <select
                                                            name="marital_status"
                                                            value={form.marital_status || ''}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                        >
                                                            <option value="">Select. Estado Cívil</option>
                                                            <option value="S">Soltero(a)</option>
                                                            <option value="C">Casado(a)</option>
                                                            <option value="D">Divorsiado(a)</option>
                                                            <option value="V">Viudo(a)</option>
                                                        </select>
                                                        <label>{errors && errors.marital_status && errors.marital_status[0]}</label>
                                                    </Form.Field>
                                                </div>       

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field error={errors && errors.date_of_birth && errors.date_of_birth[0]}>
                                                        <label htmlFor="">Fecha de nacimiento <b className="text-red">*</b></label>
                                                        <input type="date"
                                                            disabled={this.state.block}
                                                            name="date_of_birth"
                                                            value={form.date_of_birth || ''}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                        />
                                                        <label>{errors && errors.date_of_birth && errors.date_of_birth[0]}</label>
                                                    </Form.Field>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <hr/>
                                            <h4 className="mt-2 mb-2"><i className="fas fa-location-arrow"></i> Ubicación</h4>
                                            <hr/>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field error={errors && errors.cod_dep && errors.cod_dep[0]}>
                                                <label htmlFor="">Departamento <b className="text-red">*</b></label>
                                                <select name="cod_dep"
                                                    value={form.cod_dep || ''}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                >
                                                    <option value="">Select. Departamento</option>
                                                    {this.state.departamentos.map(obj => 
                                                        <option value={obj.cod_dep} key={`dep-${obj.departamento}`}>{obj.departamento}</option>
                                                    )}
                                                </select>
                                                <label>{errors && errors.cod_dep && errors.cod_dep[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field error={errors && errors.cod_pro && errors.cod_pro[0]}>
                                                <label htmlFor="">Provincias <b className="text-red">*</b></label>
                                                <select
                                                    name="cod_pro"
                                                    value={form.cod_pro || ''}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                    disabled={!form.cod_dep}
                                                >
                                                    <option value="">Select. Provincia</option>
                                                    {this.state.provincias.map(obj =>
                                                        <option key={`prov-${obj.pro}`} value={obj.cod_pro}>{obj.provincia}</option>    
                                                    )}
                                                </select>
                                                <label>{errors && errors.cod_pro && errors.cod_pro[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field error={errors && errors.cod_dis && errors.cod_dis[0]}>
                                                <label htmlFor="">Distrito <b className="text-red">*</b></label>
                                                <select
                                                    name="cod_dis"
                                                    value={form.cod_dis || ''}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                    disabled={!form.cod_pro}
                                                >
                                                    <option value="">Select. Distrito</option>
                                                    {this.state.distritos.map(obj =>
                                                        <option key={`dis-${obj.dis}`} value={obj.cod_dis}>{obj.distrito}</option>    
                                                    )}
                                                </select>
                                                <label>{errors && errors.cod_dis && errors.cod_dis[0]}</label>
                                            </Form.Field>
                                        </div>
                                        
                                        <div className="col-md-4 mb-2">            
                                            <Form.Field error={errors && errors.address && errors.address[0]}>
                                                <label htmlFor="">Dirección <b className="text-red">*</b></label>
                                                <input type="text"
                                                    name="address"
                                                    value={form.address || ''}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                                <label>{errors && errors.address && errors.address[0]}</label>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Correo de Contacto</label>
                                                <input type="text"
                                                    name="email_contact"
                                                    placeholder="Ingrese el correo de contacto"
                                                    value={form.email_contact || ''}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>
            
                                        <div className="col-md-4 mb-2">
                                            <Form.Field>
                                                <label htmlFor="">Teléfono</label>
                                                <input type="text"
                                                    name="phone"
                                                    value={form.phone || ''}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                    placeholder="Ingrese un número telefónico"
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-12">
                                            <hr/>
                                        </div>

                                        <div className="col-md-12 text-right">
                                            <Button color="orange"
                                                basic
                                                onClick={this.onExist}
                                            >
                                                <i className="fas fa-user"></i> Ya existe!!!
                                            </Button>

                                            <Button color="teal"
                                                onClick={this.create}
                                            >
                                                <i className="fas fa-save"></i> Guardar y Continuar
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </Body>
                    </div>
                </Fragment>
            )
        }
}