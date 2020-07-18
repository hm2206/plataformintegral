import React, { Component, Fragment } from 'react'
import { Form, Image, Select, Button } from 'semantic-ui-react';
import Router from 'next/router';
import { authentication, unujobs } from '../../../services/apis';
import { parseOptions, backUrl, parseUrl } from '../../../services/utils';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import btoa from 'btoa'
import Show from '../../../components/show';

export default class EditTrabajador extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname, store } = ctx;
        return { query, pathname }
    }

    state = {
        loader: false,
        edit: false,
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
        this.findPerson();
    }

    componentWillUpdate = async (nextProps, nextState) => {
        let { form } = this.state;
        if (nextState.form && form.cod_dep != nextState.form.cod_dep) {
            await this.getProvincias(nextState.form);
        }
        if (nextState.form && form.cod_pro != nextState.form.cod_pro) {
            await this.getDistritos(nextState.form);
        }
    }

    findPerson = async () => {
        this.props.fireLoading(true);
        let { query } = this.props;
        let id = query.id ? atob(query.id) : '__error';
        await authentication.get(`find_person/${id}`)
        .then(async res => {
            let { data } = res;
            // config 
            data.cod_dep = `${data.badge_id}`.substr(0, 2);
            data.cod_pro = `${data.badge_id}`.substr(2, 2);
            data.cod_dis = `${data.badge_id}`.substr(4, 2);
            // setting
            await this.setState({ form: data, image_render: data.image_images.image_400x400 });
        })
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    handleBack = () => {
        let { pathname, query, push } = Router;
        this.setState({ loader: true });
        if (query.href) {
            push(query.href);
        } else {
            push({ pathname: backUrl(pathname), query });
        }
    }

    handleImage = ({ name, value, files }) => {
        let archivo = files[0];
        let reader = new FileReader();
        if (archivo) {
            this.setState({ image: archivo });
            reader.readAsDataURL(archivo);
            reader.onloadend = () => {
                this.setState({ image_render: reader.result, edit: true });
            }
        }
    }

    handleInput = async ({ name, value }, object = 'form') => {
        await this.setState({ edit: true });
        let newObj = Object.assign({}, this.state[object]);
        let newErrors = Object.assign({}, this.state.errors);
        newObj[name] = value;
        newErrors[name] = "";
        await this.setState({ [object]: newObj, errors: newErrors });
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
        // validar cod_dep
        if (form.cod_dep) {
            await authentication.get(`get_provincias/${form.cod_dep}`)
            .then(res => this.setState({ provincias: res.data }))
            .catch(err => console.log(err.message));
        } else this.setState({ provincias: [], distritos: [] });
        // validar edit
        let { edit } = this.state;
        if (edit) {
            let obj = Object.assign({}, this.state.form);
            obj['cod_pro'] = "";
            obj['cod_dis'] = "";
            // set
            this.setState({ form: obj });
        }
    }

    getDistritos = async (form) => {
        // validar cod_dep
        if (form.cod_pro) {
            await authentication.get(`get_distritos/${form.cod_dep}/${form.cod_pro}`)
            .then(res => this.setState({ distritos: res.data }))
            .catch(err => console.log(err.message));
        } else this.setState({ distritos: [] });
        // validar edit
        let { edit } = this.state;
        if (edit) {
            let obj = Object.assign({}, this.state.form);
            obj['cod_dis'] = "";
            // set  
            this.setState({ form: obj });
        }
    }

    update = async () => {
        this.setState({ loader: true });
        const form = new FormData;
        for(let key in this.state.form) {
            await form.append(key, this.state.form[key]);
        }
        // add imagen
        form.append('image', this.state.image);
        // request
        await authentication.post(`person/${this.state.form.id}/update`, form)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            this.setState({ person: {}, form: {} });
        }).catch(err => {
            try {
                let response = JSON.parse(err.message);
                Swal.fire({ icon: 'warning', text: response.message });
                this.setState({ errors: response.errors || {} });
            } catch (error) { 
                Swal.fire({ icon: 'error', text: err.message })
            }
        });
        this.setState({ loader: false });
    }

    render() {    

        let { image_render, form, errors } = this.state;
        let { query } = this.props;

            return (
                <Fragment>
                    <div className="col-md-12">
                        <Body>
                            <div className="card-header">
                                <BtnBack onClick={this.handleBack}/> <span className="ml-3"><i className="fas fa-plus"></i> Editar Persona</span>
                            </div>

                            <div className="card-body">
                                <Form loading={this.state.loader}>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <div className="row justify-content-center">
                                                <Image circular src={image_render} 
                                                    size="small"
                                                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                                                />
                                                <div className="col-md-12 text-center">
                                                    <label htmlFor="image" className="text-primary" 
                                                        style={{ cursor: "pointer" }}
                                                        title="Agregar foto de la persona"
                                                    >
                                                        <b><i className="fas fa-image"></i> Seleccionar Foto de la Persona</b>
                                                        <input type="file" 
                                                            accept="image/*" 
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
                                                    {this.state.departamentos.map((obj, indexDep) => 
                                                        <option value={obj.cod_dep} key={`dep-${indexDep}`}>{obj.departamento}</option>
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
                                                    {this.state.provincias.map((obj, indexPro ) =>
                                                        <option key={`prov-${indexPro}`} value={obj.cod_pro}>{obj.provincia}</option>    
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
                                                    {this.state.distritos.map((obj, indexDis) =>
                                                        <option key={`dis-${indexDis}`} value={obj.cod_dis}>{obj.distrito}</option>    
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
                                            <Show condicion={this.state.edit}>
                                                <Button color="red">
                                                    <i className="fas fa-times"></i> Cancelar
                                                </Button>
                                            </Show>

                                            <Button color="teal"
                                                disabled={!this.state.edit}
                                                onClick={this.update}
                                            >
                                                <i className="fas fa-save"></i> Guardar Datos
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