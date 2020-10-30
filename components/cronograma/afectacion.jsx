import React, { useContext, useState, useEffect } from 'react';
import { unujobs, authentication, recursoshumanos } from '../../services/apis';
import { Form, Select, Button, Radio } from 'semantic-ui-react';
import Show from '../show';
import ConsultaIframe from '../consultaIframe';
import { parseOptions } from '../../services/utils';
import storage from '../../services/storage.json';
import Swal from 'sweetalert2';
import { CronogramaContext } from '../../contexts/CronogramaContext';
import Skeleton from 'react-loading-skeleton';
import { SelectDependencia } from '../select/authentication';

const Afectacion = () => {

    const { historial, setHistorial, setBlock, edit, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);

    const [errors, setErrors] = useState({});

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, historial);
        newForm[name] = value;
        setHistorial(newForm);
    }

    useEffect(() => {
        setIsEditable(true);
        setIsUpdatable(true);
        if(historial.id) setBlock(false);
    }, [historial.id]);

    return (
        <Form className="row" id="form-afectacion">
                <Show condicion={edit}>
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
                        <Show condicion={edit}>
                            <Select
                                // options={parseOptions(afps, ['sel-afp', '', 'Select. AFP'], ['id', 'id', 'descripcion'])}
                                options={[]}
                                placeholder="Select. AFP"
                                value={historial.afp_id}
                                name="afp_id"
                                onChange={(e, obj) => handleInput(obj)}
                                error={errors.afp_id && errors.afp_id[0]}
                            />
                            <label>{errors.afp_id && errors.afp_id[0]}</label>
                        </Show>
                        <Show condicion={!edit}>
                            <input type="text"
                                disabled={true}
                                value={historial.afp ? historial.afp : ''}
                                readOnly
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Fecha de Ingreso</h5></label>
                        <input 
                            type="date" 
                            name="fecha_de_ingreso"
                            value={historial.fecha_de_ingreso || ""}
                            disabled={true}
                            readOnly
                        />
                    </Form.Field>

                    <Form.Field error={errors.meta_id && errors.meta_id[0]}>
                        <label><h5>Meta <b className="text-red">*</b></h5></label>
                        <Show condicion={edit}>
                            <Select
                                // options={parseOptions(metas, ['sel-meta', '', 'Select. Meta'], ['id', 'id', 'metaID'])}
                                options={[]}
                                placeholder="Select. Meta"
                                value={historial.meta_id}
                                name="meta_id"
                                onChange={(e, obj) => handleInput(obj)}
                                error={errors.meta_id && errors.meta_id[0]}
                            />
                            <label>{errors.meta_id && errors.meta_id[0]}</label>
                        </Show>
                        <Show condicion={!edit}>
                            <input type="text" name="meta_id"
                                disabled={true}
                                value={historial.meta ? historial.meta : ''}
                                readOnly
                            />
                        </Show>
                    </Form.Field>
                    
                    <Form.Field>
                        <label><h5>Planilla</h5></label>
                        <input type="text"
                            value={historial.planilla ? historial.planilla : ''}
                            disabled={true}
                            readOnly
                        />
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Tip. Cuenta</h5></label>
                        <input type="text"
                            value={historial.banco ? historial.banco : 'B NACIÓN'}
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
                            value={historial.numero_de_cussp ? historial.numero_de_cussp : ''}
                            onChange={(e) => handleInput(e.target)}
                            disabled={!edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Fecha de Cese</h5></label>
                        <input type="date" 
                            name="fecha_de_cese"
                            value={historial.fecha_de_cese ? historial.fecha_de_cese : ''}
                            disabled={true}
                            readOnly
                        />
                    </Form.Field>

                    <Form.Field error={errors.cargo_id && errors.cargo_id[0]}>
                        <label><h5>Partición Presup. <b className="text-red">*</b></h5></label>
                        <Show condicion={edit}>
                            <Select
                                // options={parseOptions(cargos, ['sel-cargo', '', 'Select. Cargo'], ['id', 'id', 'descripcion'])}
                                options={[]}
                                placeholder="Select. Cargo"
                                value={historial.cargo_id}
                                name="cargo_id"
                                onChange={(e, obj) => handleInput(obj)}
                            />
                            <label>{errors.cargo_id && errors.cargo_id[0]}</label>
                        </Show>
                        <Show condicion={!edit}>
                            <input type="text" 
                                value={historial.cargo ? historial.cargo : ''}
                                disabled={true}
                                readOnly
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field error={errors.dependencia_id && errors.dependencia_id[0]}>
                        <label><h5>Dependencia/Oficina <b className="text-red">*</b></h5></label>
                        <SelectDependencia
                            name="dependencia_id"
                            value={historial.dependencia_id || ""}
                            disabled={!edit}
                        />
                        <label>{errors.dependencia_id && errors.dependencia_id[0]}</label>
                    </Form.Field>

                    <Form.Field>
                        <label><h5>N° Cuenta</h5></label>
                        <input type="text"
                            value={historial.numero_de_cuenta ? historial.numero_de_cuenta : ''}
                            disabled={!edit}
                            name="numero_de_cuenta"
                            onChange={({target}) => handleInput(target)}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-3">
                    <Form.Field>
                        <label><h5>Fecha de Afiliación</h5></label>
                        <input type="date" 
                            name="fecha_de_afiliacion"
                            value={historial.fecha_de_afiliacion ? historial.fecha_de_afiliacion : ''}
                            onChange={(e) => handleInput(e.target)}
                            disabled={!edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Tipo Categoría</h5></label>
                        <input type="text"
                            disabled={true}
                            name="type_categoria_id"
                            readOnly
                            value={historial.type_categoria ? historial.type_categoria : ''}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Ext. Presupuestal</h5></label>
                        <Show condicion={edit}>
                            <Select
                                // options={parseOptions(cargos, ['sel-cargo', '', 'Select. Cargo'], ['id', 'id', 'ext_pptto'])}
                                options={[]}
                                placeholder="Select. Cargo"
                                value={historial.cargo_id}
                                disabled
                                readOnly
                            />
                        </Show>
                        <Show condicion={!edit}>
                            <input type="text" 
                            name="ext_pptto" 
                            value={historial.ext_pptto} 
                            disabled
                            readOnly/>
                        </Show>
                    </Form.Field>

                    <Form.Field error={errors.perfil_laboral_id && errors.perfil_laboral_id[0]}>
                        <label><h5>Perfil Laboral <b className="text-red">*</b></h5></label>
                        <Select
                            disabled={!edit}
                            // options={parseOptions(perfil_laborales, ['sel_per_lab', '', 'Select. Perfil Laboral'], ['id', 'id', 'nombre'])}
                            options={[]}
                            placeholder="Select. Perfil Laboral"
                            value={historial.perfil_laboral_id || ''}
                            name="perfil_laboral_id"
                            onChange={(e, obj) => handleInput(obj)}
                            error={errors.perfil_laboral_id && errors.perfil_laboral_id[0]}
                        />
                        <label>{errors.perfil_laboral_id && errors.perfil_laboral_id[0]}</label>
                    </Form.Field>

                    <Form.Field>
                        <label className="mb-2"><h5>Situación Laboral <b className="text-red">*</b></h5></label>
                        <Select
                            // options={parseOptions(this.props.situacion_laborals, ['sel_sit_lab', '', 'Select. Situación Laboral'], ['id', 'id', 'nombre'])}
                            options={[]}
                            placeholder="Select. Situación Laboral"
                            value={historial.situacion_laboral_id || ""}
                            name="situacion_laboral_id"
                            onChange={(e, obj) => handleInput(obj)}
                            disabled={!edit}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-3">
                    <Form.Field>
                        <label><h5>N° Autogenerado</h5></label>
                        <input type="text" 
                            name="numero_de_essalud"
                            value={historial.numero_de_essalud ? historial.numero_de_essalud : ''}
                            onChange={(e) => handleInput(e.target)}
                            disabled={!edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label><h5>Plaza</h5></label>
                        <input type="text" 
                            name="plaza"
                            value={historial.plaza ? historial.plaza : ''}
                            onChange={(e) => handleInput(e.target)}
                            disabled={!edit}
                        />
                    </Form.Field>

                    <Form.Field error={errors.pap && errors.pap[0]}>
                        <label><h5>P.A.P <b className="text-red">*</b></h5></label>
                        <Select
                            options={storage.pap}
                            placeholder="Select. P.A.P"
                            value={historial.pap}
                            name="pap"
                            onChange={(e, obj) => handleInput(obj)}
                            disabled={!edit}
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
                            value={historial.prima_seguro || 0}
                            name="prima_seguro"
                            onChange={(e, obj) => handleInput(obj)}
                            disabled={!edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label className="mb-2"><h5>{historial.is_pay ? 'Remunerada' : 'No Remunerada'}</h5></label>
                        <Radio toggle checked={historial.is_pay ? true : false}
                            disabled={!edit}
                            onChange={(e, obj) => handleInput({ name: 'is_pay', value: obj.checked ? 1 : 0 })}
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
                            value={historial.observacion ? historial.observacion : ''}
                            disabled={!edit}
                            onChange={(e) => handleInput(e.target)}
                        />
                        <label>{errors.observacion && errors.observacion[0]}</label>
                    </Form.Field>
                </div>

                <div className="col-md-3 mt-3">
                    <Form.Field>
                        <label className="mb-2"><h5>{historial.is_email ? 'Enviar Email' : 'No Enviar Email'}</h5></label>
                        <Radio toggle checked={historial.is_email ? true : false}
                            disabled={!edit}
                            onChange={(e, obj) => handleInput({ name: 'is_email', value: obj.checked ? 1 : 0 })}
                        />
                    </Form.Field>
                </div>

                {/* Render tools */}
                <ConsultaIframe 
                    isClose={(e) => this.setState({ ssp: false })}
                    // show={this.state.ssp}
                    titulo="Consulta al Sistema Privado de Pensiones"
                    url="https://www2.sbs.gob.pe/afiliados/paginas/Consulta.aspx"
                />
                <ConsultaIframe 
                    isClose={(e) => this.setState({ essalud: false })}
                    md="8"
                    // show={this.state.essalud}
                    titulo="Consulta al Sistema de  Essalud"
                    url="http://ww4.essalud.gob.pe:7777/acredita/"
                />
            </Form>
    )
}


export default Afectacion;

// export default class Afectacion extends Component {


//     state = {
//         historial: {},
//         work: {},
//         afps: [],
//         info: {},
//         type_afps: [],
//         metas: [],
//         cargos: [],
//         type_categorias: [],
//         dependencias: [],
//         perfil_laborales: [],
//         errors: {},
//         error_message: "",
//         ssp: false,
//         essalud: false,
//     };


//     async componentDidMount() {
//         await this.setting(this.props, this.state);
//         await this.getAFPs();
//         this.getMetas();
//         this.getTypeCategorias(this.state);
//         this.getDependencias();
//     }

//     async componentWillReceiveProps(nextProps) {
//         if (!nextProps.loading && nextProps.historial != this.props.historial) {
//             await this.setting(nextProps);
//         }
//         // update send
//         if (nextProps.send && nextProps.send != this.props.send) {
//             await this.update();
//         }
//         // update al cancelar
//         if (!nextProps.edit && nextProps.edit != edit) {
//             await this.setting(nextProps);
//             this.handlePerfilLaborales(nextProps.historial.dependencia_id);
//         }
//     }

//     setting = async (nextProps) => {
//         await this.setState({ historial: {} });
//         this.setState({ historial: nextProps.historial || {}, errors: {} });
//     }

//     getDependencias = async (page = 1) => {
//         await authentication.get(`dependencia?page=${page}`)
//         .then(async res => {
//             let { dependencia, success, message } = res.data;
//             if (!success) throw new Error(message);
//             await  this.setState(state => ({ 
//                 dependencias: [...state.dependencias, ...dependencia.data], 
//                 perfil_laborales: [] 
//             }));
//             // validar dependencia
//             if (dependencia.lastPage > page) await this.getDependencias(page + 1)
//             else this.handlePerfilLaborales(this.state.historial.dependencia_id);
//         })
//         .catch(err => console.log(err.message));
//     }

//     handlePerfilLaborales = async (dependencia_id = null, page = 1) => {
//         if (dependencia_id) {
//             await authentication.get(`dependencia/${dependencia_id}/perfil_laboral`)
//             .then(async res => {
//                 let { success, message, perfil_laboral } = res.data;
//                 if (!success) throw new Error(message);
//                 this.setState(state => ({ perfil_laborales: [...state.perfil_laborales, ...perfil_laboral.data] }));
//                 if (perfil_laboral.lastPage > page) await this.handlePerfilLaborales(dependencia_id, page + 1);
//             }).catch(err => console.log(err.message));
//         } else {
//             this.setState({ perfil_laborales: [] });
//             handleInput({ name: 'perfil_laboral_id', value: '' });
//         }
//     } 

//     getAFPs = async () => {
//         await unujobs.get(`afp`).then(res => this.setState({
//             afps: res.data ? res.data : []
//         })).catch(err => console.log(err.message));
//     }

//     handleInput = async ({ name, value }) => {
//         let newObject = Object.assign({}, this.state.historial);
//         let newErrors = Object.assign({}, this.state.errors);
//         newObject[name] = value;
//         newErrors[name] ? newErrors[name] = "" : null;
//         // setting data
//         await this.setState({ historial: newObject, errors: newErrors });
//         // validar
//         switch (name) {
//             case 'dependencia_id':
//                 this.handlePerfilLaborales(value, 1);
//                 handleInput({ name: 'perfil_laboral_id', value: "" });
//                 this.setState({ perfil_laborales: [] });
//                 break;
//             default:
//                 break;
//         }
//     }

//     getMetas = () => {
//         let {historial} = this.state;
//         unujobs.get(`cronograma/${historial.cronograma_id}/meta`)
//         .then(res => this.setState({metas: res.data}))
//         .catch(err => console.log(err.message));
//     }

//     getTypeCategorias = (state) => {
//         let {historial} = state;
//         unujobs.get(`type_categoria/${historial.type_categoria_id}`)
//         .then(res => {
//             this.setState({ cargos: res.data.cargos ? res.data.cargos : [] });
//         }).catch(err => console.log(err.message));
//     }

//     update = async () => {
//         let { historial } = this.state;
//         let form = Object.assign({}, historial);
//         form._method = 'PUT';
//         await unujobs.post(`historial/${this.state.historial.id}`, form, { headers: { CronogramaID: historial.cronograma_id } })
//         .then(async res => {
//             this.props.setLoading(false);
//             let { success, message } = res.data;
//             if (!success) throw new Error(message);
//             await Swal.fire({ icon: 'success', text: message });
//             this.props.setEdit(false);
//             this.props.updatingHistorial();
//         })
//         .catch(err => {
//             try {
//                 this.props.setLoading(false);
//                 let { message, errors } = err.response.data;
//                 this.setState({ errors });
//                 Swal.fire({ icon: 'warning', text: 'Datos incorrectos' });
//             } catch (error) {
//                 Swal.fire({ icon: 'error', text: err.message });
//             }
//         });
//         this.props.setSend(false);
//         this.props.setLoading(false);
//     }

//     render() {

//         let {
//             historial,
//             cargos,
//             dependencias,
//             afps,
//             metas,
//             errors,
//             perfil_laborales
//         } = this.state;

//         return (
            
//         )
//     }

// }
