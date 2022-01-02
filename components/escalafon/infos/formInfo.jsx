import React, { useEffect } from 'react';
import { Checkbox, Form, Select } from 'semantic-ui-react';
import { SelectDependencia, SelectDependenciaPerfilLaboral } from '../../select/authentication';
import { SelectPlanilla, SelectMeta, SelectCargo, SelectCargoTypeCategoria, SelectTypeCargo, SelectSitacionLaboral, SelectTypeAportacion } from '../../select/cronograma';
import { pap } from '../../../services/storage.json';
import { SelectHourhand } from '../../select/escalafon';

const FormInfo = ({ form = {}, errors = {}, disabled = false, onChange = null, children = null }) => {

    const handleInput = (e, { name, value }) => {
        if (typeof onChange == 'function') onChange(e, { name, value });
    }

    useEffect(() => {
        handleInput({}, { name: "perfil_laboral_id", value: "" });
    }, [form.dependencia_id]);

    return (
        <Form>
            <div className="row w-100">
                <div className="col-md-4 mb-3">
                    <Form.Field>
                        <label htmlFor="">Código AIRHSP</label>
                        <input type="text"
                            name="code_airhsp"
                            value={form.code_airhsp}
                            placeholder="Código de AIRHSP"
                            onChange={(e) => handleInput(e, e.target)}
                            disabled={disabled}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors && errors.planilla_id && errors.planilla_id[0] ? true : false}>
                        <label htmlFor="">Planilla <b className="text-red">*</b></label>
                        <SelectPlanilla
                            name="planilla_id"
                            value={form.planilla_id}
                            onChange={handleInput}
                            disabled={disabled}
                        />
                        <label>{errors && errors.planilla_id && errors.planilla_id[0]}</label>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors && errors.type_cargo_id && errors.type_cargo_id[0] ? true : false}>
                        <label htmlFor="">Tipo Trabajador <b className="text-red">*</b></label>
                        <SelectTypeCargo
                            displayText={(d) => d.description}
                            name="type_cargo_id"
                            value={form.type_cargo_id}
                            onChange={handleInput}
                            disabled={disabled}
                        />
                        <label>{errors && errors.type_cargo_id && errors.type_cargo_id[0]}</label>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors && errors.meta_id && errors.meta_id[0] ? true : false}>
                        <label htmlFor="">MetaID <b className="text-red">*</b></label>
                        <SelectMeta
                            name="meta_id"
                            value={form.meta_id}
                            year={new Date().getFullYear()}
                            onChange={handleInput}
                            disabled={disabled}
                        />
                        <label>{errors && errors.meta_id && errors.meta_id[0]}</label>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors && errors.meta_id && errors.meta_id[0] ? true : false}>
                        <label htmlFor="">ActividadID <b className="text-red">*</b></label>
                        <SelectMeta
                            name="meta_id"
                            text="actividadID"
                            value={form.meta_id}
                            year={new Date().getFullYear()}
                            onChange={handleInput}
                            disabled={disabled}
                        />
                        <label>{errors && errors.meta_id && errors.meta_id[0]}</label>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors && errors.meta_id && errors.meta_id[0] ? true : false}>
                        <label htmlFor="">Meta <b className="text-red">*</b></label>
                        <SelectMeta
                            name="meta_id"
                            text="meta"
                            value={form.meta_id}
                            year={new Date().getFullYear()}
                            onChange={handleInput}
                            disabled={disabled}
                        />
                        <label>{errors && errors.meta_id && errors.meta_id[0]}</label>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors && errors.cargo_id && errors.cargo_id[0] ? true : false}>
                        <label htmlFor="">Partición Presupuestal. <b className="text-red">*</b></label>
                        <SelectCargo
                            name="cargo_id"
                            value={form.cargo_id}
                            onChange={handleInput}
                            disabled={disabled}
                        />
                        <b className="text-red">{errors && errors.cargo_id && errors.cargo_id[0]}</b>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors.cargo_id && errors.cargo_id[0] ? true : false}>
                        <label htmlFor="">Ext pptto <b className="text-red">*</b></label>
                        <SelectCargo
                            name="cargo_id"
                            text="ext_pptto"
                            value={form.cargo_id}
                            onChange={handleInput}
                            disabled={disabled}
                        />
                        <label htmlFor="">{errors.cargo_id && errors.cargo_id[0] ? true : false}</label>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors.type_categoria_id && errors.type_categoria_id[0] ? true : false}>
                        <label htmlFor="">Tip. Categoría <b className="text-red">*</b></label>
                        <SelectCargoTypeCategoria
                            cargo_id={form.cargo_id}
                            execute={false}
                            disabled={!form.cargo_id || disabled}
                            refresh={form.cargo_id}
                            name="type_categoria_id"
                            value={form.type_categoria_id}
                            onChange={handleInput}
                        />
                        <b className="text-red">{errors && errors.type_categoria_id && errors.type_categoria_id[0]}</b>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field>
                        <label htmlFor="">P.A.P <b className="text-red">*</b></label>
                        <Select
                            options={pap}
                            placeholder="Select. P.A.P"
                            name="pap"
                            value={form.pap}
                            onChange={handleInput}
                            error={errors && errors.pap && errors.pap[0]}
                            disabled={disabled}
                        />
                        <b className="text-red">{errors && errors.pap && errors.pap[0]}</b>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field>
                        <label htmlFor="">Plaza</label>
                        <input type="text" 
                            name="plaza"
                            value={form.plaza}
                            placeholder="Plaza"
                            onChange={(e) => handleInput(e, e.target)}
                            disabled={disabled}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors.situacion_laboral_id && errors.situacion_laboral_id[0] ? true : false}>
                        <label htmlFor="">Situación Laboral <b className="text-red">*</b></label>
                        <SelectSitacionLaboral
                            disabled={disabled}
                            name="situacion_laboral_id"
                            value={form.situacion_laboral_id}
                            onChange={handleInput}
                        />
                        <b className="text-red">{errors && errors.situacion_laboral_id && errors.situacion_laboral_id[0]}</b>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors && errors.dependencia_id && errors.dependencia_id[0] ? true : false}>
                        <label htmlFor="">Dependencia/Oficina <b className="text-red">*</b></label>
                        <SelectDependencia
                            name="dependencia_id"
                            value={form.dependencia_id || ""}
                            onChange={handleInput}
                            disabled={disabled}
                        />
                        <b className="text-red">{errors && errors.dependencia_id && errors.dependencia_id[0]}</b>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors && errors.perfil_laboral_id && errors.perfil_laboral_id[0] ? true : false}>
                        <label htmlFor="">Perfil Laboral <b className="text-red">*</b></label>
                        <SelectDependenciaPerfilLaboral
                            disabled={!form.dependencia_id || disabled}
                            execute={false}
                            refresh={form.dependencia_id}
                            dependencia_id={form.dependencia_id}
                            name="perfil_laboral_id"
                            onChange={handleInput}
                            value={form.perfil_laboral_id}
                        />
                        <b className="text-red">{errors && errors.perfil_laboral_id && errors.perfil_laboral_id[0]}</b>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field>
                        <label htmlFor="">Código Asistencia</label>
                        <input type="text" 
                            name="code"
                            value={form?.code || null}
                            placeholder="código de asistencia"
                            onChange={(e) => handleInput(e, e.target)}
                            disabled={disabled}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field error={errors.hourhand_id && errors.hourhand_id[0] ? true : false}>
                        <label htmlFor="">Horario</label>
                        <SelectHourhand
                            disabled={disabled}
                            name="hourhand_id"
                            value={form.hourhand_id}
                            onChange={handleInput}
                        />
                        <b className="text-red">{errors && errors.hourhand_id && errors.hourhand_id[0]}</b>
                    </Form.Field>
                </div>

                <div className="col-md-4 mb-3">
                    <Form.Field>
                        <label htmlFor="">N° Ruc</label>
                        <input type="text" 
                            placeholder="N° Ruc"
                            name="ruc"
                            value={form.ruc || ""}
                            onChange={(e) => handleInput(e, e.target)}
                            disabled={disabled}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-4">
                    <Form.Field>
                        <label htmlFor="">Aportacion Empleador</label>
                        <SelectTypeAportacion
                            name="type_aportacion_id"
                            value={form?.type_aportacion_id}
                            onChange={handleInput}
                            disabled={disabled}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors && errors.resolucion && errors.resolucion[0] ? true : false}>
                        <label htmlFor="">Resolución <b className="text-red">*</b></label>
                        <input type="text" 
                            name="resolucion"
                            placeholder="N° Resolución"
                            value={form.resolucion || ""}
                            onChange={(e) => handleInput(e, e.target)}
                            disabled={disabled}
                        />
                        <b className="text-red">{errors && errors.resolucion && errors.resolucion[0]}</b>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors && errors.fecha_de_resolucion && errors.fecha_de_resolucion[0] ? true : false}>
                        <label htmlFor="">Fecha de Resolución <b className="text-red">*</b></label>
                        <input type="date" 
                            name="fecha_de_resolucion"
                            placeholder="Fecha de resolucion"
                            value={form.fecha_de_resolucion || ""}
                            onChange={(e) => handleInput(e, e.target)}
                            disabled={disabled}
                        />
                        <b className="text-red">{errors && errors.fecha_de_resolucion && errors.fecha_de_resolucion[0]}</b>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors && errors.fecha_de_ingreso && errors.fecha_de_ingreso[0] ? true : false}>
                        <label htmlFor="">Fecha de Ingreso <b className="text-red">*</b></label>
                        <input type="date" 
                            name="fecha_de_ingreso"
                            placeholder="Fecha de ingreso"
                            value={form.fecha_de_ingreso || ""}
                            onChange={(e) => handleInput(e, e.target)}
                            disabled={disabled}
                        />
                        <b className="text-red">{errors && errors.fecha_de_ingreso && errors.fecha_de_ingreso[0]}</b>
                    </Form.Field>
                </div>

                <div className="col-md-6 mb-3">
                    <Form.Field error={errors && errors.fecha_de_cese && errors.fecha_de_cese[0] ? true : false}>
                        <label htmlFor="">Fecha de Cese </label>
                        <input type="date" 
                            placeholder="Fecha de cese"
                            name="fecha_de_cese"
                            value={form.fecha_de_cese || ""}
                            onChange={(e) => handleInput(e, e.target)}
                            disabled={disabled}
                        />
                        <label htmlFor="">{errors && errors.fecha_de_cese && errors.fecha_de_cese[0]}</label>
                    </Form.Field>
                </div>
                
                <div className="col-md-12 mb-3">
                    <Form.Field error={errors && errors.observacion && errors.observacion[0] ? true : false}>
                        <label htmlFor="">Observación <b className="text-red">*</b></label>
                        <textarea name="observacion" 
                            value={form.observacion || ""}
                            onChange={(e) => handleInput(e, e.target)}
                            disabled={disabled}
                        />
                        <label>{errors && errors.observacion && errors.observacion[0]}</label>
                    </Form.Field>
                </div>

                <div className="col-md-12 mb-3 text-right">
                    <Form.Field error={errors && errors.observacion && errors.observacion[0] ? true : false}>
                        <label htmlFor="">Estado <b className="text-red">*</b></label>
                        <Checkbox name="estado" 
                            toggle
                            checked={form.estado == 1}
                            onChange={(e, obj) => handleInput(e, { name: 'estado', value: obj.checked ? 1 : 0 })}
                            disabled={disabled}
                        />
                    </Form.Field>
                </div>

                {children}
            </div>
        </Form>
    )
}

export default FormInfo;