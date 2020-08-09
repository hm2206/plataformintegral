import React, {Component} from 'react';
import { unujobs, authentication, recursoshumanos } from '../../services/apis';
import { Form, Select, Button, Radio } from 'semantic-ui-react';
import Show from '../show';
import ConsultaIframe from '../consultaIframe';
import { parseOptions } from '../../services/utils';
import storage from '../../services/storage.json';
import Swal from 'sweetalert2';

export default class Afectacion extends Component {


    state = {
        history: {},
        work: {},
        afps: [],
        info: {},
        type_afps: [],
        metas: [],
        cargos: [],
        type_categorias: [],
        dependencias: [],
        perfil_laborales: [],
        errors: {},
        error_message: "",
        ssp: false,
        essalud: false,
    };


    async componentDidMount() {
        await this.setting(this.props, this.state);
        await this.getAFPs();
        this.getMetas();
        this.getTypeCategorias(this.state);
        this.getDependencias();
    }

    async componentWillReceiveProps(nextProps) {
        if (!nextProps.loading && nextProps.historial != this.props.historial) {
            await this.setting(nextProps);
        }
        // update send
        if (nextProps.send && nextProps.send != this.props.send) {
            await this.update();
        }
        // update al cancelar
        if (!nextProps.edit && nextProps.edit != this.props.edit) {
            await this.setting(nextProps);
            this.handlePerfilLaborales(nextProps.historial.dependencia_id);
        }
    }

    setting = async (nextProps) => {
        await this.setState({ history: {} });
        this.setState({ history: nextProps.historial || {}, errors: {} });
    }

    getDependencias = async (page = 1) => {
        await authentication.get(`dependencia?page=${page}`)
        .then(async res => {
            let { dependencia, success, message } = res.data;
            if (!success) throw new Error(message);
            await  this.setState(state => ({ 
                dependencias: [...state.dependencias, ...dependencia.data], 
                perfil_laborales: [] 
            }));
            // validar dependencia
            if (dependencia.lastPage > page) await this.getDependencias(page + 1)
            else this.handlePerfilLaborales(this.state.history.dependencia_id);
        })
        .catch(err => console.log(err.message));
    }

    handlePerfilLaborales = async (dependencia_id = null, page = 1) => {
        if (dependencia_id) {
            await authentication.get(`dependencia/${dependencia_id}/perfil_laboral`)
            .then(async res => {
                let { success, message, perfil_laboral } = res.data;
                if (!success) throw new Error(message);
                this.setState(state => ({ perfil_laborales: [...state.perfil_laborales, ...perfil_laboral.data] }));
                if (perfil_laboral.lastPage > page) await this.handlePerfilLaborales(dependencia_id, page + 1);
            }).catch(err => console.log(err.message));
        } else {
            this.setState({ perfil_laborales: [] });
            this.handleInput({ name: 'perfil_laboral_id', value: '' });
        }
    } 

    getAFPs = async () => {
        await unujobs.get(`afp`).then(res => this.setState({
            afps: res.data ? res.data : []
        })).catch(err => console.log(err.message));
    }

    handleInput = async ({ name, value }) => {
        let newObject = Object.assign({}, this.state.history);
        let newErrors = Object.assign({}, this.state.errors);
        newObject[name] = value;
        newErrors[name] ? newErrors[name] = "" : null;
        // setting data
        await this.setState({ history: newObject, errors: newErrors });
        // validar
        switch (name) {
            case 'dependencia_id':
                this.handlePerfilLaborales(value, 1);
                this.handleInput({ name: 'perfil_laboral_id', value: "" });
                this.setState({ perfil_laborales: [] });
                break;
            default:
                break;
        }
    }

    getMetas = () => {
        let {history} = this.state;
        unujobs.get(`cronograma/${history.cronograma_id}/meta`)
        .then(res => this.setState({metas: res.data}))
        .catch(err => console.log(err.message));
    }

    getTypeCategorias = (state) => {
        let {history} = state;
        unujobs.get(`type_categoria/${history.type_categoria_id}`)
        .then(res => {
            this.setState({ cargos: res.data.cargos ? res.data.cargos : [] });
        }).catch(err => console.log(err.message));
    }

    update = async () => {
        let { history } = this.state;
        let form = Object.assign({}, history);
        form._method = 'PUT';
        await unujobs.post(`historial/${this.state.history.id}`, form, { headers: { CronogramaID: history.cronograma_id } })
        .then(async res => {
            this.props.setLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            this.props.setEdit(false);
            this.props.updatingHistorial();
        })
        .catch(err => {
            try {
                this.props.setLoading(false);
                let { message, errors } = err.response.data;
                this.setState({ errors });
                Swal.fire({ icon: 'warning', text: 'Datos incorrectos' });
            } catch (error) {
                Swal.fire({ icon: 'error', text: err.message });
            }
        });
        this.props.setSend(false);
        this.props.setLoading(false);
    }

    render() {

        let {
            history,
            cargos,
            dependencias,
            afps,
            metas,
            errors,
            perfil_laborales
        } = this.state;

        return (
            <Form className="row" id="form-afectacion">
                <Show condicion={this.props.edit}>
                    <div className="col-md-12">
                        <Button color="teal" basic
                            onClick={(e) => this.setState({ ssp: true })}
                        >
                            Consulta SSP
                        </Button>

                        <Button color="teal" basic
                            onClick={(e) => this.setState({ essalud: true })}
                        >
                            Consulta Essalud
                        </Button>

                        <hr/>
                    </div>
                </Show>

                <div className="col-md-3">
                    <Form.Field error={errors.afp_id && errors.afp_id[0]}>
                        <label><h5>Ley Social <b className="text-red">*</b></h5></label>
                        <Show condicion={this.props.edit}>
                            <Select
                                options={parseOptions(afps, ['sel-afp', '', 'Select. AFP'], ['id', 'id', 'descripcion'])}
                                placeholder="Select. AFP"
                                value={history.afp_id}
                                name="afp_id"
                                onChange={(e, obj) => this.handleInput(obj)}
                                error={errors.afp_id && errors.afp_id[0]}
                            />
                            <label>{errors.afp_id && errors.afp_id[0]}</label>
                        </Show>
                        <Show condicion={!this.props.edit}>
                            <input type="text"
                                disabled={true}
                                value={history.afp ? history.afp : ''}
                                readOnly
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Fecha de Ingreso</h5></label>
                        <input 
                            type="date" 
                            name="fecha_de_ingreso"
                            value={history.fecha_de_ingreso || ""}
                            disabled={true}
                            readOnly
                        />
                    </Form.Field>

                    <Form.Field error={errors.meta_id && errors.meta_id[0]}>
                        <label><h5>Meta <b className="text-red">*</b></h5></label>
                        <Show condicion={this.props.edit}>
                            <Select
                                options={parseOptions(metas, ['sel-meta', '', 'Select. Meta'], ['id', 'id', 'metaID'])}
                                placeholder="Select. Meta"
                                value={history.meta_id}
                                name="meta_id"
                                onChange={(e, obj) => this.handleInput(obj)}
                                error={errors.meta_id && errors.meta_id[0]}
                            />
                            <label>{errors.meta_id && errors.meta_id[0]}</label>
                        </Show>
                        <Show condicion={!this.props.edit}>
                            <input type="text" name="meta_id"
                                disabled={true}
                                value={history.meta ? history.meta : ''}
                                readOnly
                            />
                        </Show>
                    </Form.Field>
                    
                    <Form.Field>
                        <label><h5>Planilla</h5></label>
                        <input type="text"
                            value={history.planilla ? history.planilla : ''}
                            disabled={true}
                            readOnly
                        />
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Tip. Cuenta</h5></label>
                        <input type="text"
                            value={history.banco ? history.banco : 'B NACIÓN'}
                            disabled={true}
                            readOnly
                        />
                    </Form.Field>

                </div>

                <div className="col-md-3">
                    <Form.Field>
                        <label><h5>N° CUSSP</h5></label>
                        <input type="text" 
                            name="numero_de_cussp"  
                            min="8"
                            value={history.numero_de_cussp ? history.numero_de_cussp : ''}
                            onChange={(e) => this.handleInput(e.target)}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Fecha de Cese</h5></label>
                        <input type="date" 
                            name="fecha_de_cese"
                            value={history.fecha_de_cese ? history.fecha_de_cese : ''}
                            disabled={true}
                            readOnly
                        />
                    </Form.Field>

                    <Form.Field error={errors.cargo_id && errors.cargo_id[0]}>
                        <label><h5>Partición Presup. <b className="text-red">*</b></h5></label>
                        <Show condicion={this.props.edit}>
                            <Select
                                options={parseOptions(cargos, ['sel-cargo', '', 'Select. Cargo'], ['id', 'id', 'descripcion'])}
                                placeholder="Select. Cargo"
                                value={history.cargo_id}
                                name="cargo_id"
                                onChange={(e, obj) => this.handleInput(obj)}
                            />
                            <label>{errors.cargo_id && errors.cargo_id[0]}</label>
                        </Show>
                        <Show condicion={!this.props.edit}>
                            <input type="text" 
                                value={history.cargo ? history.cargo : ''}
                                disabled={true}
                                readOnly
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field error={errors.dependencia_id && errors.dependencia_id[0]}>
                        <label><h5>Dependencia/Oficina <b className="text-red">*</b></h5></label>
                        <Select
                            options={parseOptions(dependencias, ['sel_dep', '', 'Select. Dependencia/Oficina'], ['id', 'id', 'nombre'])}
                            placeholder="Select. Dependencia/Oficina"
                            value={history.dependencia_id || ""}
                            name="dependencia_id"
                            onChange={(e, obj) => this.handleInput(obj)}
                            error={errors.dependencia_id && errors.dependencia_id[0]}
                            disabled={!this.props.edit}
                        />
                        <label>{errors.dependencia_id && errors.dependencia_id[0]}</label>
                    </Form.Field>

                    <Form.Field>
                        <label><h5>N° Cuenta</h5></label>
                        <input type="text"
                            value={history.numero_de_cuenta ? history.numero_de_cuenta : ''}
                            disabled={!this.props.edit}
                            name="numero_de_cuenta"
                            onChange={({target}) => this.handleInput(target)}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-3">
                    <Form.Field>
                        <label><h5>Fecha de Afiliación</h5></label>
                        <input type="date" 
                            name="fecha_de_afiliacion"
                            value={history.fecha_de_afiliacion ? history.fecha_de_afiliacion : ''}
                            onChange={(e) => this.handleInput(e.target)}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Tipo Categoría</h5></label>
                        <input type="text"
                            disabled={true}
                            name="type_categoria_id"
                            readOnly
                            value={history.type_categoria ? history.type_categoria : ''}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Ext. Presupuestal</h5></label>
                        <Show condicion={this.props.edit}>
                            <Select
                                options={parseOptions(cargos, ['sel-cargo', '', 'Select. Cargo'], ['id', 'id', 'ext_pptto'])}
                                placeholder="Select. Cargo"
                                value={history.cargo_id}
                                disabled
                                readOnly
                            />
                        </Show>
                        <Show condicion={!this.props.edit}>
                            <input type="text" 
                            name="ext_pptto" 
                            value={history.ext_pptto} 
                            disabled
                            readOnly/>
                        </Show>
                    </Form.Field>

                    <Form.Field error={errors.perfil_laboral_id && errors.perfil_laboral_id[0]}>
                        <label><h5>Perfil Laboral <b className="text-red">*</b></h5></label>
                        <Select
                            disabled={!this.props.edit}
                            options={parseOptions(perfil_laborales, ['sel_per_lab', '', 'Select. Perfil Laboral'], ['id', 'id', 'nombre'])}
                            placeholder="Select. Perfil Laboral"
                            value={history.perfil_laboral_id || ''}
                            name="perfil_laboral_id"
                            onChange={(e, obj) => this.handleInput(obj)}
                            error={errors.perfil_laboral_id && errors.perfil_laboral_id[0]}
                        />
                        <label>{errors.perfil_laboral_id && errors.perfil_laboral_id[0]}</label>
                    </Form.Field>

                    <Form.Field>
                        <label className="mb-2"><h5>Situación Laboral <b className="text-red">*</b></h5></label>
                        <Select
                            options={parseOptions(this.props.situacion_laborals, ['sel_sit_lab', '', 'Select. Situación Laboral'], ['id', 'id', 'nombre'])}
                            placeholder="Select. Situación Laboral"
                            value={history.situacion_laboral_id || ""}
                            name="situacion_laboral_id"
                            onChange={(e, obj) => this.handleInput(obj)}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-3">
                    <Form.Field>
                        <label><h5>N° Autogenerado</h5></label>
                        <input type="text" 
                            name="numero_de_essalud"
                            value={history.numero_de_essalud ? history.numero_de_essalud : ''}
                            onChange={(e) => this.handleInput(e.target)}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Plaza</h5></label>
                        <input type="text" 
                            name="plaza"
                            value={history.plaza ? history.plaza : ''}
                            onChange={(e) => this.handleInput(e.target)}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>

                    <Form.Field error={errors.pap && errors.pap[0]}>
                        <label><h5>P.A.P <b className="text-red">*</b></h5></label>
                        <Select
                            options={storage.pap}
                            placeholder="Select. P.A.P"
                            value={history.pap}
                            name="pap"
                            onChange={(e, obj) => this.handleInput(obj)}
                            disabled={!this.props.edit}
                        />
                        <label>{errors.pap && errors.pap[0]}</label>
                    </Form.Field>
                    
                    <Form.Field>
                        <label><h5>Prima Seguros</h5></label>
                        <Select
                            options={[
                                {key: "n", value: 0, text: "No Afecto"},
                                {key: "a", value: 1, text: "Afecto"}
                            ]}
                            placeholder="Select. Prima Seguro"
                            value={history.prima_seguro || 0}
                            name="prima_seguro"
                            onChange={(e, obj) => this.handleInput(obj)}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label className="mb-2"><h5>{history.is_pay ? 'Remunerada' : 'No Remunerada'}</h5></label>
                        <Radio toggle checked={history.is_pay ? true : false}
                            disabled={!this.props.edit}
                            onChange={(e, obj) => this.handleInput({ name: 'is_pay', value: obj.checked ? 1 : 0 })}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-9 mt-3">
                    <Form.Field error={errors.observacion && errors.observacion[0]}>
                        <label><h5>Observación <b className="text-red">*</b></h5></label>
                        <textarea
                            name="observacion"  
                            rows="8"
                            style={{width: "100%"}}
                            value={history.observacion ? history.observacion : ''}
                            disabled={!this.props.edit}
                            onChange={(e) => this.handleInput(e.target)}
                        />
                        <label>{errors.observacion && errors.observacion[0]}</label>
                    </Form.Field>
                </div>

                <div className="col-md-3 mt-3">
                    <Form.Field>
                        <label className="mb-2"><h5>{history.is_email ? 'Enviar Email' : 'No Enviar Email'}</h5></label>
                        <Radio toggle checked={history.is_email ? true : false}
                            disabled={!this.props.edit}
                            onChange={(e, obj) => this.handleInput({ name: 'is_email', value: obj.checked ? 1 : 0 })}
                        />
                    </Form.Field>
                </div>

                {/* Render tools */}
                <ConsultaIframe 
                    isClose={(e) => this.setState({ ssp: false })}
                    show={this.state.ssp}
                    titulo="Consulta al Sistema Privado de Pensiones"
                    url="https://www2.sbs.gob.pe/afiliados/paginas/Consulta.aspx"
                />
                <ConsultaIframe 
                    isClose={(e) => this.setState({ essalud: false })}
                    md="8"
                    show={this.state.essalud}
                    titulo="Consulta al Sistema de  Essalud"
                    url="http://ww4.essalud.gob.pe:7777/acredita/"
                />
            </Form>
        )
    }

}
