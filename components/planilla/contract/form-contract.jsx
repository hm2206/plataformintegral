import React from 'react';
import { Checkbox, Form, Select } from 'semantic-ui-react';
import {
  SelectTypeCategory,
  SelectDependency,
  SelectProfile,
  SelectHourhand
} from '../../select/micro-planilla';
import { pap } from '../../../services/storage.json';

const FormInfo = ({ form = {}, errors = {}, disabled = false, onChange = null, children = null }) => {

  const handleInput = (e, { name, value }) => {
    if (typeof onChange == 'function') onChange(e, { name, value });
  }

  const handleIntToInput = (e, { name, value }) => {
    const newValue = parseInt(`${value}`);
    handleInput(e, { name, value: newValue });
  }

  return (
    <Form>
      <div className="row w-100">
        <div className="col-md-4 mb-3">
          <Form.Field>
            <label htmlFor="">Código AIRHSP</label>
            <input type="text"
              name="codeAIRSHP"
              value={form.codeAIRSHP}
              placeholder="Código de AIRHSP"
              onChange={(e) => handleInput(e, e.target)}
              disabled={disabled}
            />
          </Form.Field>
        </div>

        <div className="col-md-4 mb-3">
          <Form.Field error={errors.typeCategoriaId && errors.typeCategoriaId[0] ? true : false}>
            <label htmlFor="">Tip. Categoría <b className="text-red">*</b></label>
            <SelectTypeCategory
              disabled={disabled}
              name="typeCategoryId"
              value={form.typeCategoryId || null}
              onChange={handleIntToInput}
            />
            <b className="text-red">{errors && errors.typeCategoriaId && errors.typeCategoriaId[0]}</b>
          </Form.Field>
        </div>

        <div className="col-md-4 mb-3">
          <Form.Field>
            <label htmlFor="">Condición <b className="text-red">*</b></label>
            <Select
              options={pap}
              placeholder="Select. Condición"
              name="condition"
              value={form.condition}
              onChange={handleInput}
              error={errors && errors.condition && errors.condition[0]}
              disabled={disabled}
            />
            <b className="text-red">{errors && errors.condition && errors.condition[0]}</b>
          </Form.Field>
        </div>

        <div className="col-md-4 mb-3">
          <Form.Field error={errors && errors.dependencyId && errors.dependencyId[0] ? true : false}>
            <label htmlFor="">Dependencia <b className="text-red">*</b></label>
            <SelectDependency
              name="dependencyId"
              value={form.dependencyId}
              onChange={handleIntToInput}
              disabled={disabled}
            />
            <label>{errors && errors.dependencyId && errors.dependencyId[0]}</label>
          </Form.Field>
        </div>

        <div className="col-md-4 mb-3">
          <Form.Field error={errors && errors.profileId && errors.profileId[0] ? true : false}>
            <label htmlFor="">Perfil Laboral <b className="text-red">*</b></label>
            <SelectProfile
              name="profileId"
              value={form.profileId}
              onChange={handleIntToInput}
              disabled={disabled}
            />
            <label>{errors && errors.profileId && errors.profileId[0]}</label>
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

        <div className="col-md-8 mb-3">
          <Form.Field error={errors.hourhandId && errors.hourhandId[0] ? true : false}>
            <label htmlFor="">Horario <b className="text-red">*</b></label>
            <SelectHourhand
              disabled={disabled}
              name="hourhandId"
              value={form.hourhandId}
              onChange={handleIntToInput}
            />
            <b className="text-red">{errors && errors.hourhandId && errors.hourhandId[0]}</b>
          </Form.Field>
        </div>

        <div className="col-md-4 mb-3">
          <Form.Field error={errors.codeAssistance && errors.codeAssistance[0] ? true : false}>
            <label htmlFor="">Código Asistencia <b className='text-red'>*</b></label>
            <input type="text" 
              name="codeAssistance"
              value={form?.codeAssistance || null}
              placeholder="código de asistencia"
              onChange={(e) => handleInput(e, e.target)}
              disabled={disabled}
            />
            <b className="text-red">{errors && errors.codeAssistance && errors.codeAssistance[0]}</b>
          </Form.Field>
        </div>

        <div className="col-md-6 mb-3">
          <Form.Field error={errors && errors.resolution && errors.resolution[0] ? true : false}>
            <label htmlFor="">Resolución <b className="text-red">*</b></label>
            <input type="text" 
              name="resolution"
              placeholder="N° Resolución"
              value={form.resolution || ""}
              onChange={(e) => handleInput(e, e.target)}
              disabled={disabled}
            />
            <b className="text-red">{errors && errors.resolution && errors.resolution[0]}</b>
          </Form.Field>
        </div>

        <div className="col-md-6 mb-3">
          <Form.Field error={errors && errors.dateOfResolution && errors.dateOfResolution[0] ? true : false}>
            <label htmlFor="">Fecha de Resolución <b className="text-red">*</b></label>
            <input type="date" 
              name="dateOfResolution"
              placeholder="Fecha de resolucion"
              value={form.dateOfResolution || ""}
              onChange={(e) => handleInput(e, e.target)}
              disabled={disabled}
            />
            <b className="text-red">{errors && errors.dateOfResolution && errors.dateOfResolution[0]}</b>
          </Form.Field>
        </div>

        <div className="col-md-6 mb-3">
          <Form.Field error={errors && errors.dateOfAdmission && errors.dateOfAdmission[0] ? true : false}>
            <label htmlFor="">Fecha de Ingreso <b className="text-red">*</b></label>
            <input type="date" 
              name="dateOfAdmission"
              placeholder="Fecha de ingreso"
              value={form.dateOfAdmission || ""}
              onChange={(e) => handleInput(e, e.target)}
              disabled={disabled}
            />
            <b className="text-red">{errors && errors.dateOfAdmission && errors.dateOfAdmission[0]}</b>
          </Form.Field>
        </div>

        <div className="col-md-6 mb-3">
          <Form.Field error={errors && errors.terminationDate && errors.terminationDate[0] ? true : false}>
            <label htmlFor="">Fecha de Cese </label>
            <input type="date" 
              placeholder="Fecha de cese"
              name="terminationDate"
              value={form.terminationDate || ""}
              onChange={(e) => handleInput(e, e.target)}
              disabled={disabled}
            />
            <label htmlFor="">{errors && errors.terminationDate && errors.terminationDate[0]}</label>
          </Form.Field>
        </div>
          
        <div className="col-md-12 mb-3">
          <Form.Field error={errors && errors.observation && errors.observation[0] ? true : false}>
            <label htmlFor="">Observación</label>
            <textarea name="observation" 
              value={form.observation || ""}
              onChange={(e) => handleInput(e, e.target)}
              disabled={disabled}
            />
            <label>{errors && errors.observation && errors.observation[0]}</label>
          </Form.Field>
        </div>

        <div className="col-md-12 mb-3 text-right">
          <Form.Field error={errors && errors.state && errors.state[0] ? true : false}>
            <label htmlFor="">Estado <b className="text-red">*</b></label>
            <Checkbox name="state" 
                toggle
                checked={form.state}
                onChange={(e, obj) => handleInput(e, { name: 'state', value: obj.checked })}
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