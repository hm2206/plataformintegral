import React, { Component, Fragment } from 'react';
import { Form, Select, Button, Icon, Divider } from 'semantic-ui-react';
import Show from '../../../components/show';
import { unujobs } from '../../../services/apis';
import { parseOptions, Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import { findPersonal } from '../../../storage/actions/personalActions';
import atob from 'atob';

export default class EditPersonal extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname } = ctx;
        query.id = atob(query.id || '_error');
        await ctx.store.dispatch(findPersonal(ctx));
        let { personal } = ctx.store.getState().personal;
        return { pathname, query, personal };
    };

    state = {
        form: {
            sede_id: 1,
        },
        bases: [],
        loading: false,
        errors: {},
        dependencias: [],
        convocatoria: {
            page: 1,
            data: []
        },
        meta: {
            page: 1,
            data: []
        }
    }

    componentDidMount = async () => {
        this.setting();
        this.getMetas();
        this.getDependencias();
    }

    setting = () => {
        this.setState((state, props) => {
            state.bases = JSON.parse(props.personal.bases);
            props.personal.bases = "";
            return { form: props.personal, bases: state.bases };
        })
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

    getDependencias = async () => {
        await unujobs.get(`dependencia`)
        .then(async res => this.setState({ dependencias: res.data }))
        .catch(err => console.log(err.message));
    }

    handleInput = ({ name, value }, obj = 'form', err = 'errors') => {
        this.setState(state => {
            let newObj = state[obj];
            let newErr = state[err];
            newObj[name] = value;
            newErr[name] = null;
            return { [obj]: newObj, [err]: newErr };
        });
    }

    readySend = () => {
        let { numero_de_convocatoria, fecha_inicio, fecha_final, observacion } = this.state;
        return numero_de_convocatoria && fecha_inicio && fecha_final && observacion;
    }

    saveAndContinue = async () => {
        await this.setState({ loading: true });
        let form = new FormData;
        for(let attr in this.state.form) {
            form.append(attr, this.state.form[attr]);
        }
        //leave convocatoria
        form.delete('convocatoria');
        // add method
        form.append('_method', 'PUT');
        // add bases
        form.append('bases', this.state.bases.join(';;'));
        // send
        await unujobs.post(`personal/${this.props.personal.id}`, form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
        })
        .catch(err => {
            try {
                let { data } = err.response;
                this.setState({ errors: data.errors })
            } catch (error) {
                Swal.fire({ icon: 'error', text: err.message });
            }
        });
        this.setState({ loading: false });
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
                                <Form loading={this.state.loading} action="#" className="col-md-10" onSubmit={(e) => e.preventDefault()}>
                                    <div className="row justify-content-center">

                                        <h5 className="col-md-12">
                                            <hr/>
                                            <i className="fas fa-sync"></i> Convocatoria Vinculada
                                            <hr/>
                                        </h5>

                                        <div className="col-md-12">
                                            <div className="row">
                                                <Form.Field className="col-md-6">
                                                    <label htmlFor="" className="text-left">N° Convocatoria</label>
                                                    <input type="text" 
                                                        disabled
                                                        defaultValue={form.convocatoria && form.convocatoria.numero_de_convocatoria || ""}
                                                    />
                                                </Form.Field>

                                                <Form.Field className="col-md-6">
                                                    <label htmlFor="" className="text-left">Código Público</label>
                                                    <input type="text" 
                                                        disabled
                                                        defaultValue={form.slug || ""}
                                                    />
                                                </Form.Field>
                                            </div>
                                        </div>

                                        <h5 className="col-md-12">
                                            <hr/>
                                            <i className="fas fa-info-circle"></i> Información del Requerimiento de Personal
                                            <hr/>
                                        </h5>

                                        <Form.Field className="col-md-6">
                                            <label htmlFor="" className="text-left">Sede </label>
                                            <Select
                                                name="sede_id"
                                                placeholder="Select. Sede"
                                                value={form.sede_id || ""}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                options={[
                                                    {key: "puc", value: 1, text: "Pucallpa"}
                                                ]}
                                                disabled
                                            />
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

                                        <Form.Field className="col-md-6" error={errors.perfil_laboral && errors.perfil_laboral[0]}>
                                            <label htmlFor="" className="text-left">Perfil Laboral<b className="text-red">*</b></label>
                                            <input type="text"
                                                name="perfil_laboral"
                                                placeholder="Ingrese el perfil laboral del trabajador"
                                                value={form.perfil_laboral || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors.perfil_laboral && errors.perfil_laboral[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.cantidad && errors.cantidad[0]}>
                                            <label htmlFor="" className="text-left">Cantidad <b className="text-red">*</b></label>
                                            <input type="number"
                                                name="cantidad"
                                                pattern="^[0-9]+"
                                                placeholder="Ingrese la cantidad de trabajadores requeridos"
                                                value={form.cantidad || 0}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors.cantidad && errors.cantidad[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.honorarios && errors.honorarios[0]}>
                                            <label htmlFor="" className="text-left">Honorarios <b className="text-red">*</b></label>
                                            <input type="number"
                                                name="honorarios"
                                                placeholder="Ingrese los honorarios a pagar"
                                                value={form.honorarios || 0}
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
                                                value={form.fecha_inicio}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors.fecha_inicio && errors.fecha_inicio[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.fecha_final && errors.fecha_final[0]}>
                                            <label>Fecha Final <b className="text-red">*</b></label>
                                            <input type="date"
                                                name="fecha_final"
                                                value={form.fecha_final}
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
                                    
                                        <Form.Field className="col-md-6" error={errors.deberes && errors.deberes[0]}>
                                            <label htmlFor="" className="text-left">Deberes a cumplir <b className="text-red">*</b></label>
                                            <textarea name="deberes"
                                                rows="6"
                                                value={form.deberes || ""}
                                                placeholder="Ingrese los deberes a realizar el trabajador"
                                                onChange={({ target }) => this.handleInput(target)}
                                            />
                                            <label>{errors.deberes && errors.deberes[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-6" error={errors.lugar && errors.lugar[0]}>
                                            <label>Lugar <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="lugar"
                                                value={form.lugar}
                                                placeholder="Ingrese el lugar de la entidad/institución"
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors.lugar && errors.lugar[0]}</label>
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
                                                value={form.bases}
                                                onChange={(e) => this.handleInput(e.target)}
                                                placeholder="Ingrese la descripción de la Base Legal"
                                            />
                                            <label>{errors.bases && errors.bases[0]}</label>
                                        </Form.Field>

                                        <Form.Field className="col-md-2" error={errors.bases && errors.bases[0]}>
                                            <label className="text-center">Agregar</label>
                                            <Button icon="plus"
                                                fluid
                                                onClick={(e) => this.addBase()}
                                            />
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