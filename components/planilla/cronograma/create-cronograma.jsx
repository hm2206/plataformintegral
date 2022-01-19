import React, { useEffect, useState, useContext } from 'react';
import { Form, Button, Checkbox, Select } from 'semantic-ui-react';
import Show from '../../show';
import { microPlanilla } from '../../../services/apis';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import { SelectPlanilla } from '../../select/micro-planilla';
import { AppContext } from '../../../contexts';
import { EntityContext } from '../../../contexts/EntityContext';
import Modal from '../../modal';
import { SelectMonth } from '../../Utils';

const schemaDefault = {
    year: (new Date).getFullYear(), 
    month: (new Date).getMonth() + 1,
    adicional: false
}

const CreateCronograma = ({ principal = true, onClose = null, onSave =  null }) => {

  // app
  const app_context = useContext(AppContext);

  // entity
  const entity_context = useContext(EntityContext);

  // estados
  const [is_ready, setIsReady] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  // manejador de cambios de form
  const handleInput = ({ name, value }) => {
    let newForm = Object.assign({}, form);
    newForm[name] = value;
    setForm(newForm);
    let newErrors = Object.assign({}, errors);
    newErrors[name] = [];
    setErrors(newErrors);
  }

  const handleIntInput = ({ name, value }) => {
    const newValue = parseInt(`${value}`);
    handleInput({ name, value: newValue });
  }

  // predetenerminados
  useEffect(() => {
    setForm({ ...schemaDefault });
    setIsReady(true);
  }, []);

  // limpiar info
  useEffect(() => {
    if (is_ready) setForm({ ...form, adicional: 0, remanente: 0, copy_detalle: 0 });
  }, [form.type_id]);

  // limpiar adicional
  useEffect(() => {
      if (is_ready) setForm({ ...form, remanente: 0 });
  }, [form.adicional]);

  // guardar los datos
  const save = async () => {
    let answer = await Confirm("warning", `¿Estás seguro en crear el cronograma?`, 'Crear')
    if (!answer) return false;
    app_context.setCurrentLoading(true);
    const payload = Object.assign({}, form);
    payload.campusId = entity_context.entity_id;
    payload.adicional = form?.adicional ? true : false;
    payload.remanente = form?.remanente ? true : false;
    await microPlanilla.post('cronogramas', payload)
    .then(async (res) => {
      app_context.setCurrentLoading(false);
      await Swal.fire({ icon: 'success', text: `El cronograma se creó correctamente!` });
      setForm({ ...schemaDefault })
      if (typeof onSave == 'function') onSave(res.data);
    }).catch(() => {
        app_context.setCurrentLoading(false);
        Swal.fire({ icon: 'error', text: 'No se pudo guardar los datos' })
    });
  }

  // renderizado
  return (
    <Modal show={true}
      md="8"
      isClose={onClose}
      titulo={<span><i className="fas fa-plus"></i> Crear Cronograma</span>}
    >
      <div className="card-body">
        <div className="row justify-content-center">
          <Form action="#" className="col-md-12" onSubmit={(e) => e.preventDefault()}>
            <div className="row justify-content-between">
              <Form.Field className="col-md-12" error={errors.planillaId && errors.planillaId[0] ? true : false}>
                <label htmlFor="" className="text-left">Planilla <b className="text-danger">*</b></label>
                <SelectPlanilla
                  name="planillaId"
                  principal={principal}
                  value={form.planillaId}
                  onChange={(e, obj) => handleIntInput(obj)}
                />
                <label htmlFor="">{errors.planillaId && errors.planillaId[0] || ""}</label>
              </Form.Field>

              <Form.Field className="col-md-6" error={errors.year && errors.year[0] ? true : false}>
                <label htmlFor="">Año</label>
                <input
                  className="text-left"
                  name="year"
                  type="number"
                  value={form.year || ""}  
                  onChange={({ target }) => handleIntInput(target)}
                  placeholder='Ingrese el año'
                  disabled
                />
                <label htmlFor="">{errors.year && errors.year[0] || ""}</label>
              </Form.Field>

              <Form.Field className="col-md-6" error={errors.mes && errors.mes[0] ? true : false}>
                <label htmlFor="">Mes <b className="text-danger">*</b></label>
                <SelectMonth
                  disabled={true}
                  name="month"
                  value={form?.month || ''}  
                  onChange={(target) => handleIntInput(target)}
                />
                <label htmlFor="">{errors.mes && errors.mes[0] || ""}</label>
              </Form.Field>

              <div className="col-12"></div>

              <Show condicion={form?.planillaId}>
                <Form.Field className="col-md-6">
                  <label htmlFor="">¿Es una planilla adicional?</label>
                  <div>
                    <Checkbox toggle
                      name="adicional"
                      checked={form.adicional ? true : false}
                      onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                    />
                  </div>
                </Form.Field>
              </Show>

              <Show condicion={form.adicional == 1}>
                <Form.Field className="col-md-6">
                  <label htmlFor="">¿Es una planilla remanente?</label>
                  <div>
                    <Checkbox toggle
                      name="remanente"
                      checked={form.remanente ? true : false}
                      onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                    />
                  </div>
                </Form.Field>

                <div className="col-md-6"></div>
              </Show>
                
              <Form.Field className="col-md-12">
                <label htmlFor="" className="text-left">Observación</label>
                <textarea name="observation"
                  rows="6"
                  value={form.observation || ""}
                  placeholder="Ingrese una observación para el cronograma"
                  onChange={({ target }) => handleInput(target)}
                />
              </Form.Field>
            </div>

            <div className="col-md-12 mt-3 text-right">
              <Button
                color="teal"
                onClick={save}
              >
                <i className="fas fa-save"></i> Guardar
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  )
}

// exportar
export default CreateCronograma;