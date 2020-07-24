import React, { Component, Fragment } from 'react';
import { Form, Select, Button, Icon, Divider } from 'semantic-ui-react';
import Show from '../../../components/show';
import { unujobs, recursoshumanos } from '../../../services/apis';
import { parseOptions, Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';

let tmp_convocatorias = [];

const getConvocatorias = async (ctx, page = 1) => {
    await recursoshumanos.get(`convocatoria?estado=CREADO&page=${page}`, {}, ctx)
    .then(async res => {
        let { lastPage, data } = res.data.convocatoria; 
        // update
        tmp_convocatorias = [...tmp_convocatorias, ...data];
        // validate
        if (lastPage > page + 1) {
            await this.getConvocatorias(page + 1);
        }
    })
    .catch(err => tmp_convocatorias = []);
}


export default class RegisterPersonal extends Component
{

    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname } = ctx;
        await getConvocatorias(ctx);
        return { pathname, query, convocatorias: tmp_convocatorias };
    };

    state = {
        form: {
            sede_id: 1,
        },
        bases: [],
        loading: false,
        errors: {},
        dependencias: [],
        perfil_laborals: [],
        meta: {
            page: 1,
            data: []
        }
    }

    componentDidMount = async () => {
        this.props.fireEntity({ render: true });
        this.getMetas();
        this.getDependencias();
    }

    componentWillUnmount = () => {
        tmp_convocatorias = [];
    }

    getMetas = async () => {
        let { meta } = this.state;
        await unujobs.get(`meta`)
        .then(async res => {
            let { last_page, data } = res.data; 
            // update
            await this.setState(async state => {
                // add 
                meta.data = await [...meta.data, ...data];
                // validate
                if (last_page > meta.page) {
                    meta.page += 1;
                    await this.getMetas();
                }
                return { meta }
            });
        }).catch(err => console.log(err.message));
    }

    getDependencias = async (page = 1) => {
        await recursoshumanos.get(`dependencia?page=${page}`)
        .then(async res => {
            let { dependencia, success, message } = res.data;
            if (!success) throw new Error(message);
            this.setState(state => ({ dependencias: [...state.dependencias, ...dependencia.data] }));
            if (dependencia.lastPage > (page + 1)) await this.getDependencias(page + 1);
        })
        .catch(err => console.log(err.message));
    }

    getPerfilLaboral = async (id, page = 1) => {
        if (id) {
            await recursoshumanos.get(`dependencia/${id}/perfil_laboral?page=${page}`)
            .then(async res => {
                let { perfil_laboral, success, message } = res.data;
                if (!success) throw new Error(message);
                this.setState(state => ({ perfil_laborals: page == 1 ? perfil_laboral.data : [...state.perfil_laborals, ...perfil_laboral.data] }));
                if (perfil_laboral.lastPage > (page + 1)) await this.getPerfilLaboral(id, page + 1);
            })
            .catch(err => console.log(err.message));
        } else {
            this.setState({ perfil_laborals: [] });
        }
    }

    handleInput = async ({ name, value }, obj = 'form', err = 'errors', limite = 0) => {
        await this.setState(state => {
            let newObj = state[obj];
            let newErr = state[err];
            // validar limite
            if (limite && value.length <= limite) {
                newObj[name] = value
            } else if(!limite) {
                newObj[name] = value;
                newErr[name] = null;
            }
            // response
            return { [obj]: newObj, [err]: newErr };
        });
        // changed
        switch (name) {
            case "dependencia_id":
                await this.getPerfilLaboral(value);
                break;
            default:
                break;
        }
    }

    readySend = () => {
        let { numero_de_convocatoria, fecha_inicio, fecha_final, observacion } = this.state;
        return numero_de_convocatoria && fecha_inicio && fecha_final && observacion;
    }

    saveAndContinue = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar los datos?`, 'Guardar')
        if (answer) {
            this.props.fireLoading(true);
            let form = new FormData;
            for(let attr in this.state.form) {
                form.append(attr, this.state.form[attr]);
            }
            // add bases
            form.append('bases', JSON.stringify(this.state.bases));
            // send
            await recursoshumanos.post('staff_requirement', form)
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                this.setState({
                    form: { sede_id: 1 },
                    bases: []
                })
            })
            .catch(err => {
                try {
                    this.props.fireLoading(false);
                    let response = JSON.parse(err.message);
                    this.setState({ errors: response.errors });
                    Swal.fire({ icon: 'warning', text: response.message });
                } catch (error) {
                    Swal.fire({ icon: 'error', text: err.message });
                }
            });
            this.props.fireLoading(false);
        }
    }

    handleClose = () => {
        this.setState({ loading: true });
        let { push, pathname } = Router;
        let newPath = pathname.split('/');
        newPath.splice(-1, 1);
        push({  pathname: newPath.join('/') });
    }

    handleBack = async () => {
        this.setState({ loading: true });
        let { pathname, query } = Router;
        let newBack = pathname.split('/');
        newBack.splice(-1, 1);
        Router.push({ pathname: newBack.join('/') });
    }

    addBase = async () => {
        let bases = this.state.form.bases || "";
        if (bases.length < 10) {
            await Swal.fire({ icon: 'warning', text: 'La base debe tener como minimo 10 carácteres' });
        } else {
            await this.setState(state => {
                state.bases.push(bases);
                return { bases: state.bases };
            });
            // vaciar
            this.handleInput({ name: 'bases', value: '' });
        }
    }

    deleteBase = async (index) => {
        let value = await Confirm("warning", `¿Estás seguro en eliminar la base legal N° ${index + 1}?`, "Confirmar");
        if (value) {
            this.setState(async state => {
                await state.bases.splice(index, 1);
                return { bases: state.bases };
            });
        }
    }

    render() {

        let { errors, form, meta } = this.state;
        let { convocatorias } = this.props;

        return (
            <div className="col-md-12">
                <Body>                    
                    <div className="card- mt-3">
                        <div className="card-header">
                        <BtnBack
                            onClick={this.handleBack}
                        /> Registrar Requerimiento de Personal
                        </div>
                        <div className="card-body">
                            <div className="row justify-content-center">
                                <Form action="#" className="col-md-10" onSubmit={(e) => e.preventDefault()}>
                                    <div className="row justify-content-center">

                                        <h5 className="col-md-12">
                                            <hr/>
                                            <i className="fas fa-sync"></i> Vincular a una Convocatoria
                                            <hr/>
                                        </h5>

                                        <div className="col-md-12">
                                            <div className="row">
                                                <Form.Field className="col-md-6" error={errors.convocatoria_id && errors.convocatoria_id[0]}>
                                                <label htmlFor="" className="text-left">Convocatoria <b className="text-red">*</b></label>
                                                <Select
                                                    options={parseOptions(convocatorias, ["Select-conv", "", "Select. Convocatoria"], ["id", "id", "numero_de_convocatoria"])}
                                                    name="convocatoria_id"
                                                    placeholder="Select. Convocatoria"
                                                    value={form.convocatoria_id || ""}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                />
                                                <label>{errors.convocatoria_id && errors.convocatoria_id[0]}</label>
                                            </Form.Field>
                                            </div>
                                        </div>

                                        <h5 className="col-md-12">
                                            <hr/>
                                            <i className="fas fa-info-circle"></i> Información del Requerimiento de Personal
                                            <hr/>
                                        </h5>

                                        <Form.Field className="col-md-6" error={errors.sede_id && errors.sede_id[0]}>
                                            <label htmlFor="" className="text-left">Sede <b className="text-red">*</b></label>
                                            <Select
                                                name="sede_id"
                                                placeholder="Select. Sede"
                                                value={form.sede_id || ""}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                options={[
                                                    {key: "puc", value: 1, text: "Pucallpa"}
                                                ]}
                                            />
                                            <label>{errors.sede_id && errors.sede_id[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.dependencia_id && errors.dependencia_id[0]}>
                                            <label htmlFor="" className="text-left">Dependencia/Oficina <b className="text-red">*</b></label>
                                            <Select
                                                name="dependencia_id"
                                                placeholder="Select. Dependencia/Oficina"
                                                value={form.dependencia_id || ""}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                options={parseOptions(this.state.dependencias, ["Select-depend", "", "Select. Dependencia/Oficina"], ["id", "id", "nombre"])}
                                            />
                                            <label>{errors.dependencia_id && errors.dependencia_id[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.perfil_laboral_id && errors.perfil_laboral_id[0] || ""}>
                                            <label htmlFor="" className="text-left">Perfil Laboral<b className="text-red">*</b></label>
                                            <Select
                                                name="perfil_laboral_id"
                                                placeholder="Select. Perfil Laboral"
                                                value={form.perfil_laboral_id || ""}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                options={parseOptions(this.state.perfil_laborals, ["Select-perfil-lab", "", "Select. Perfil Laboral"], ["id", "id", "nombre"])}
                                            />
                                            <label>{errors.perfil_laboral_id && errors.perfil_laboral_id[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.cantidad && errors.cantidad[0]}>
                                            <label htmlFor="" className="text-left">Cantidad <b className="text-red">*</b></label>
                                            <input type="number"
                                                name="cantidad"
                                                pattern="^[0-9]+"
                                                placeholder="Ingrese la cantidad de trabajadores requeridos"
                                                value={form.cantidad || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors.cantidad && errors.cantidad[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.honorarios && errors.honorarios[0]}>
                                            <label htmlFor="" className="text-left">Honorarios <b className="text-red">*</b></label>
                                            <input type="number"
                                                name="honorarios"
                                                placeholder="Ingrese los honorarios a pagar"
                                                value={form.honorarios || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors.honorarios && errors.honorarios[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.meta_id && errors.meta_id[0]}>
                                            <label htmlFor="" className="text-left">Meta Presupuestal <b className="text-red">*</b></label>
                                            <Select
                                                options={parseOptions(meta.data, ["Select-meta", "", "Select. Meta Pre."], ["id", "id", "metaID"])}
                                                name="meta_id"
                                                placeholder="Select. Meta Pre."
                                                value={form.meta_id || ""}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                            <label>{errors.meta_id && errors.meta_id[0]}</label>
                                        </Form.Field>


                                        <Form.Field className="col-md-6" error={errors.renovacion && errors.renovacion[0]}>
                                            <label className="text-left">Renovación de Contrato <b className="text-red">*</b></label>
                                            <Select
                                                name="renovacion"
                                                placeholder="Select. Condición de contrato"
                                                value={form.renovacion || 0}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                options={[
                                                    {key: 'sin-renovacion', value: 0, text: 'Sin Renovación'},
                                                    {key: 'con-renovacion', value: 1, text: 'Con Renovación'},
                                                ]}
                                            />
                                            <label>{errors.renovacion && errors.renovacion[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.fecha_inicio && errors.fecha_inicio[0]}>
                                            <label>Fecha de Inicio <b className="text-red">*</b></label>
                                            <input type="date"
                                                name="fecha_inicio"
                                                value={form.fecha_inicio || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors.fecha_inicio && errors.fecha_inicio[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.fecha_final && errors.fecha_final[0]}>
                                            <label>Fecha Final <b className="text-red">*</b></label>
                                            <input type="date"
                                                name="fecha_final"
                                                value={form.fecha_final || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors.fecha_final && errors.fecha_final[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.supervisora_id && errors.supervisora_id[0]}>
                                            <label className="text-left">Dependencia/Oficina Supervisora <b className="text-red">*</b></label>
                                            <Select
                                                options={parseOptions(this.state.dependencias, ["Select-depend-super", "", "Select. Dependencia/Oficina Supervisora"], ["id", "id", "nombre"])}
                                                name="supervisora_id"
                                                placeholder="Select. Dependencia/Oficina Supervisora"
                                                value={form.supervisora_id || ""}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                            <label>{errors.supervisora_id && errors.supervisora_id[0]}</label>
                                        </Form.Field>
                                    
                                        <Form.Field className="col-md-12" error={errors.deberes && errors.deberes[0]}>
                                            <label htmlFor="" className="text-left">Deberes a cumplir <b className="text-red">*</b></label>
                                            <textarea name="deberes"
                                                rows="6"
                                                value={form.deberes || ""}
                                                placeholder="Ingrese los deberes a realizar el trabajador"
                                                onChange={({ target }) => this.handleInput(target)}
                                            />
                                            <label>{errors.deberes && errors.deberes[0]}</label>
                                        </Form.Field>

                                        <h5 className="col-md-12">
                                            <hr/>
                                            <i className="fas fa-landmark"></i> Bases Legales <Show condicion={this.state.bases.length}>({this.state.bases.length})</Show>
                                            <hr/>
                                        </h5>

                                        <Form.Field className="col-md-10" error={errors.bases && errors.bases[0]}>
                                            <label htmlFor="" className="text-left">Descripción de la Base Legal <b className="text-red">*</b></label>
                                            <textarea 
                                                name="bases"
                                                rows="6"
                                                value={form.bases || ""}
                                                onChange={(e) => this.handleInput(e.target, 'form', 'errors', 255)}
                                                placeholder="Ingrese la descripción de la Base Legal"
                                            />
                                            <label>{errors.bases && errors.bases[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-2" error={errors.bases && errors.bases[0]}>
                                            <label className="text-center">Agregar</label>
                                            <Button icon="plus"
                                                fluid
                                                onClick={(e) => this.addBase()}
                                                disabled={form.bases && form.bases.length < 10}
                                            />

                                            <small className="mt-3">{form.bases && form.bases.length || 0}/255</small>
                                        </Form.Field>

                                        {this.state.bases.map((obj, index) => 
                                            <Fragment key={`bases-${obj}`}>
                                                <div className="col-md-12"><hr/></div>
                                                <Form.Field className="col-md-10" >
                                                    <label  className="text-left">Base Legal N° {index + 1}</label>
                                                    <textarea
                                                        rows="6"
                                                        value={obj}
                                                        readOnly
                                                    />
                                                </Form.Field>

                                                <Form.Field className="col-md-2" error={errors.bases && errors.bases[0]}>
                                                    <label className="text-center">Eliminar</label>
                                                    <Button icon="trash" 
                                                        color="red"
                                                        fluid
                                                        onClick={(e) => this.deleteBase(index)}
                                                    />
                                                </Form.Field>
                                            </Fragment>    
                                        )}

                                        <div className="col-md-12">
                                            <hr/>
                                        </div>

                                        <div className="col-md-12 text-right">
                                            <Button color="teal"
                                                disabled={this.state.loading || this.state.bases.length == 0}
                                                onClick={this.saveAndContinue}
                                                loading={this.state.loading}
                                            >
                                                <Icon name="save"/> Guardar y Continuar
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </Body>
            </div>
        )
    }

}