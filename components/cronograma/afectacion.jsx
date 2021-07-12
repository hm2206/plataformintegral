import React, { useContext, useState, useEffect } from 'react';
import { unujobs } from '../../services/apis';
import { Form, Select, Button, Radio, Checkbox } from 'semantic-ui-react';
import Show from '../show';
import { Confirm } from '../../services/utils';
import storage from '../../services/storage.json';
import Swal from 'sweetalert2';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../contexts/AppContext';
import Skeleton from 'react-loading-skeleton';
import { SelectDependencia, SelectDependenciaPerfilLaboral } from '../select/authentication';
import { SelectAfp, SelectMeta, SelectSitacionLaboral, SelectTypeCategoriaCargo, SelectBanco } from '../select/cronograma';

const PlaceHolderInput = ({ count = 1, height = "38px" }) => <Skeleton height={height} count={count}/>

const Afectacion = () => {

    const { cronograma, historial, setHistorial, setBlock, edit, setEdit, send, setSend, setIsEditable, setIsUpdatable, loading, cancel, setRefresh } = useContext(CronogramaContext);
    const [old, setOld] = useState({});
    const [errors, setErrors] = useState({});
    const [current_cargos, setCurrentCargos] = useState([]);
    
    // app
    const app_context = useContext(AppContext);

    // change inputs
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, historial);
        newForm[name] = value;
        setHistorial(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // actualizar historial
    const updateHistorial = async () => {
        app_context.setCurrentLoading(true);
        let form = Object.assign({}, historial);
        form._method = 'PUT';
        await unujobs.post(`historial/${historial.id}`, form, { headers: { CronogramaID: historial.cronograma_id } })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setEdit(false);
                setErrors({});
                setRefresh(true);
            }).catch(err => {
                try {
                    app_context.setCurrentLoading(false);
                    let { message, errors } = err.response.data;
                    setErrors(errors);
                    Swal.fire({ icon: 'warning', text: 'Datos incorrectos' });
                } catch (error) {
                    Swal.fire({ icon: 'error', text: err.message });
                }
            });
        setSend(false);
        setBlock(false);
    }

    // primera carga o cada cambio de historial
    useEffect(() => {
        setIsEditable(true);
        setIsUpdatable(true);
        if(historial.id) {
            setBlock(false);
            setOld(JSON.parse(JSON.stringify(historial)));
        }
    }, [historial.id]);

    // cancelar edit
    useEffect(() => {
        if (cancel) setHistorial(old);
    }, [cancel]);

    // update historial
    useEffect(() => {
        if (send) updateHistorial();
    }, [send]);

    // render
    return (
        <Form className="row" id="form-afectacion">
                <div className="col-md-3">
                    <Form.Field error={errors.afp_id && errors.afp_id[0]}>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Ley Social <b className="text-red">*</b></h5></label>
                            <Show condicion={edit}>
                                <SelectAfp
                                    value={historial.afp_id}
                                    name="afp_id"
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                                <label>{errors.afp_id && errors.afp_id[0]}</label>
                            </Show>
                            <Show condicion={!edit}>
                                <input type="text"
                                    value={historial.afp ? historial.afp : ''}
                                    readOnly
                                />
                            </Show>
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Fecha de Ingreso</h5></label>
                            <input 
                                type="date" 
                                name="fecha_de_ingreso"
                                value={historial.fecha_de_ingreso || ""}
                                readOnly
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field error={errors.meta_id && errors.meta_id[0]}>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Meta <b className="text-red">*</b></h5></label>
                            <Show condicion={edit}>
                                <SelectMeta
                                    year={cronograma.year}
                                    value={historial.meta_id}
                                    name="meta_id"
                                    onChange={(e, obj) => handleInput(obj)}
                                    error={errors.meta_id && errors.meta_id[0]}
                                />
                                <label>{errors.meta_id && errors.meta_id[0]}</label>
                            </Show>
                            <Show condicion={!edit}>
                                <input type="text" name="meta_id"
                                    value={historial.meta ? historial.meta : ''}
                                    readOnly
                                />
                            </Show>
                       </Show>
                    </Form.Field>
                    
                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Planilla</h5></label>
                            <input type="text"
                                value={historial.planilla ? historial.planilla : ''}
                                readOnly
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field error={errors?.banco_id?.[0] ? true : false}>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Tip. Cuenta</h5></label>
                            <Show condicion={edit}
                                predeterminado={
                                    <input type="text"
                                        value={historial.banco ? historial.banco : 'B NACIÓN'}
                                        readOnly
                                    />
                                }
                            >
                                <SelectBanco
                                    value={historial.banco_id || ""}
                                    name="banco_id"
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                                <label>{errors.banco_id && errors.banco_id[0]}</label>
                            </Show>
                        </Show>
                    </Form.Field>

                </div>

                <div className="col-md-3">
                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>N° CUSSP</h5></label>
                            <input type="text" 
                                name="numero_de_cussp"  
                                min="8"
                                value={historial.numero_de_cussp ? historial.numero_de_cussp : ''}
                                onChange={(e) => handleInput(e.target)}
                                readOnly={!edit}
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Fecha de Cese</h5></label>
                            <input type="date" 
                                name="fecha_de_cese"
                                value={historial.fecha_de_cese ? historial.fecha_de_cese : ''}
                                readOnly
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field error={errors.cargo_id && errors.cargo_id[0]}>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Partición Presup. <b className="text-red">*</b></h5></label>
                            <Show condicion={edit}>
                                <SelectTypeCategoriaCargo
                                    type_categoria_id={historial.type_categoria_id}
                                    value={historial.cargo_id || ""}
                                    name="cargo_id"
                                    cronograma_id={cronograma.id}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                                <label>{errors.cargo_id && errors.cargo_id[0]}</label>
                            </Show>
                            <Show condicion={!edit}>
                                <input type="text" 
                                    value={historial.cargo ? historial.cargo : ''}
                                    readOnly
                                />
                            </Show>
                        </Show>
                    </Form.Field>

                    <Form.Field error={errors.dependencia_id && errors.dependencia_id[0]}>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Dependencia/Oficina <b className="text-red">*</b></h5></label>
                            <Show condicion={edit}
                                predeterminado={<input value={historial.dependencia && historial.dependencia.nombre || ""} readOnly/>}
                            >
                                <SelectDependencia
                                    name="dependencia_id"
                                    value={historial.dependencia_id || ""}
                                    disabled={!edit}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                                <label>{errors.dependencia_id && errors.dependencia_id[0]}</label>
                            </Show>
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>N° Cuenta</h5></label>
                            <input type="text"
                                value={historial.numero_de_cuenta ? historial.numero_de_cuenta : ''}
                                readOnly={!edit}
                                name="numero_de_cuenta"
                                onChange={({target}) => handleInput(target)}
                            />
                        </Show>
                    </Form.Field>
                </div>

                <div className="col-md-3">
                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Fecha de Afiliación</h5></label>
                            <input type="date" 
                                name="fecha_de_afiliacion"
                                value={historial.fecha_de_afiliacion ? historial.fecha_de_afiliacion : ''}
                                onChange={(e) => handleInput(e.target)}
                                readOnly={!edit}
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Tipo Categoría</h5></label>
                            <input type="text"
                                name="type_categoria_id"
                                readOnly
                                value={historial.type_categoria ? historial.type_categoria : ''}
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Ext. Presupuestal</h5></label>
                            <Show condicion={edit}>
                                <SelectTypeCategoriaCargo
                                    type_categoria_id={historial.type_categoria_id}
                                    value={historial.cargo_id || ""}
                                    name="cargo_id"
                                    text="ext_pptto"
                                    cronograma_id={cronograma.id}
                                    disabled={!current_cargos.length}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                            </Show>
                            <Show condicion={!edit}>
                                <input type="text" 
                                name="ext_pptto" 
                                value={historial.ext_pptto} 
                                readOnly/>
                            </Show>
                        </Show>
                    </Form.Field>

                    <Form.Field error={errors.perfil_laboral_id && errors.perfil_laboral_id[0]}>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Perfil Laboral <b className="text-red">*</b></h5></label>
                            <Show condicion={edit}
                                predeterminado={<input value={historial.perfil_laboral && historial.perfil_laboral.nombre || ""} readOnly/>}
                            >
                                <SelectDependenciaPerfilLaboral
                                    disabled={!edit}
                                    dependencia_id={historial.dependencia_id}
                                    refresh={historial.dependencia_id}
                                    value={historial.perfil_laboral_id}
                                    name="perfil_laboral_id"
                                    onChange={(e, obj) => handleInput(obj)}
                                    error={errors.perfil_laboral_id && errors.perfil_laboral_id[0]}
                                />
                            </Show>
                            <label>{errors.perfil_laboral_id && errors.perfil_laboral_id[0]}</label>
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label className="mb-2"><h5>Situación Laboral <b className="text-red">*</b></h5></label>
                            <Show condicion={edit}
                                predeterminado={<input type="text" readOnly value={historial.situacion_laboral || ""}/>}
                            >
                                <SelectSitacionLaboral
                                    value={historial.situacion_laboral_id}
                                    name="situacion_laboral_id"
                                    onChange={(e, obj) => handleInput(obj)}
                                    disabled={!edit}
                                />
                            </Show>
                        </Show>
                    </Form.Field>
                </div>

                <div className="col-md-3">
                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>N° Autogenerado</h5></label>
                            <input type="text" 
                                name="numero_de_essalud"
                                value={historial.numero_de_essalud ? historial.numero_de_essalud : ''}
                                onChange={(e) => handleInput(e.target)}
                                readOnly={!edit}
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Plaza</h5></label>
                            <input type="text" 
                                name="plaza"
                                value={historial.plaza ? historial.plaza : ''}
                                onChange={(e) => handleInput(e.target)}
                                readOnly={!edit}
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field error={errors.pap && errors.pap[0]}>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
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
                        </Show>
                    </Form.Field>
                    
                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label><h5>Prima Seguros</h5></label>
                            <Checkbox toggle
                                checked={historial.prima_seguro ? true : false}
                                name="prima_seguro"
                                onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                disabled={!edit}
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label className="mb-2"><h5>Dias Lab.</h5></label>
                            <input type="number"
                                name="dias"
                                step="any"
                                value={historial.dias || ""}
                                onChange={({target}) => handleInput(target)}
                                readOnly={!edit}
                            />
                        </Show>
                    </Form.Field>
                </div>

                <div className="col-md-9 mt-3">
                    <Form.Field error={errors.observacion && errors.observacion[0]}>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput height="130px"/>}
                        >
                            <label><h5>Observación <b className="text-red">*</b></h5></label>
                            <textarea
                                name="observacion"  
                                rows="8"
                                style={{width: "100%"}}
                                value={historial.observacion ? historial.observacion : ''}
                                readOnly={!edit}
                                onChange={(e) => handleInput(e.target)}
                            />
                            <label>{errors.observacion && errors.observacion[0]}</label>
                        </Show>
                    </Form.Field>
                </div>

                <div className="col-md-3 mt-3">
                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label className="mb-2"><h5>{historial.is_pay ? 'Remunerada' : 'No Remunerada'}</h5></label>
                            <Radio toggle checked={historial.is_pay ? true : false}
                                disabled={!edit}
                                onChange={(e, obj) => handleInput({ name: 'is_pay', value: obj.checked ? 1 : 0 })}
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <Show condicion={!loading}
                            predeterminado={<PlaceHolderInput/>}
                        >
                            <label className="mb-2"><h5>{historial.is_email ? 'Enviar Email' : 'No Enviar Email'}</h5></label>
                            <Radio toggle checked={historial.is_email ? true : false}
                                disabled={!edit}
                                onChange={(e, obj) => handleInput({ name: 'is_email', value: obj.checked ? 1 : 0 })}
                            />
                        </Show>
                    </Form.Field>
                </div>
            </Form>
    )
}


export default Afectacion;
