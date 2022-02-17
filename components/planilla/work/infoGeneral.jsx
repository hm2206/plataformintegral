import React, { useContext, useEffect, useState } from 'react';
import { Form, Select } from 'semantic-ui-react';
import moment from 'moment';
import { microPlanilla, handleErrorRequest } from '../../../services/apis';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import { SelectAfp } from '../../select/micro-planilla';
import { AppContext } from '../../../contexts/AppContext'
import Router from 'next/dist/client/router';
import AssingTrabajadorEntity from '../../contrato/assingTrabajadorEntity'
import { BtnFloat } from '../../Utils'
import btoa from 'btoa'
import { useMemo } from 'react';

const InfoGeneral = ({ work }) => {

    // app
    const app_context = useContext(AppContext);

    const options = {
        EDIT_PERSON: 'EDIT[PERSON]',
        SEARCH_WORK: 'SEARCH[WORK]',
    }

    // estados
    const [person, setPerson] = useState({});
    const [current_work, setCurrentWork] = useState(work || {});
    const [edit, setEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [option, setOption] = useState("");

    const handleInput = ({ name, value }) => {
        let newObject = Object.assign({}, current_work);
        newObject[name] = value;
        setCurrentWork(newObject);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    const leaveForm = async (e) => {
        e.preventDefault();
        let answer = await Swal.fire({
            icon: 'warning',
            text: "¿Está seguro en cancelar la edición?",
            confirmButtonText: "Cancelar Edición",
            showCancelButton: true
        });
        // verify
        if (answer) {
            setCurrentWork(JSON.parse(JSON.stringify(work)))
            setEdit(false);
            setErrors({});
        }
    }

    useEffect(() => {
        setPerson(Object.assign({}, work.person || {}));
    }, [work]);

  // render
  return (
    <>
      <Form>
          <div className="row">
              <div className="col-md-12 mb-4">
                  <h4><i className="fas fa-info-circle"></i> Datos Generales del Trabajador</h4>
              </div>

              <div className="col-md-4">
                  <div>
                      <b><i className="fas fa-place"></i> Ubicación</b>
                      <hr/>
                  </div>
                  <iframe src={`https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d63151.44781604753!2d-74.58435273334369!3d-8.405050255752414!3m2!1i1024!2i768!4f13.1!2m1!1s${person && person.address}!5e0!3m2!1ses!2spe!4v1586299621785!5m2!1ses!2spe`} 
                      frameborder="0" 
                      style={{ border: "0px", width: "100%", height: "200px" }}
                      aria-hidden="false" 
                      tabindex="0"
                  />
              </div>

                  <div className="col-md-8">
                      <b><i className="fas fa-user"></i> Datos Personales</b>
                      <hr/>
                      <div className="row">
                          <div className="col-md-6 mb-2">
                              <Form.Field>
                                  <label htmlFor="">Prefijo</label>
                                  <input type="text" 
                                  className="uppercase" value={person.prefix} readOnly={true}/>
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field>
                                  <label htmlFor="">Nombre Completo</label>
                                  <input type="text" className="uppercase" value={person?.fullName || ''} readOnly={true}/>
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field>
                                  <label htmlFor="">Tipo. Documento</label>
                                  <input type="text" className="uppercase" value={person?.documentType?.name} readOnly={true}/>
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field>
                                  <label htmlFor="">N° Documento</label>
                                  <input type="text" value={person.documentNumber} readOnly={true}/>
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field>
                                  <label htmlFor="">Genero <b className="text-red">*</b></label>
                                  <Select placeholder="Select. Ubigeo" 
                                      value={person.gender}
                                      name="gender"
                                      disabled
                                      onChange={(e, obj) => this.handleInput(obj, 'person')}
                                      options={[
                                          { key: "M", value: "M", text: "Masculino" },
                                          { key: "F", value: "F", text: "Femenino" },
                                          { key: "I", value: "I", text: "No Binario" }
                                      ]}
                                  />
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field>
                                  <label htmlFor="">Fecha de Nacimiento</label>
                                  <input type="date" value={moment.utc(person.dateOfBirth).format('YYYY-MM-DD')} readOnly={true}/>
                              </Form.Field>
                          </div>

                          <div className="col-md-12 mb-2">
                              <Form.Field>
                                  <label htmlFor="">Dirección</label>
                                  <input type="text" 
                                      value={person.address || ""}
                                      name="address"
                                      readOnly
                                  />
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field>
                                  <label htmlFor="">Telefono</label>
                                  <input type="tel" 
                                      value={person.phone || ""}
                                      name="phone"
                                      readOnly
                                  />
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field>
                                  <label htmlFor="">Correo de Contacto</label>
                                  <input type="email" 
                                      value={person.emailContact || ""}
                                      name="email_contact"
                                      readOnly
                                  />
                              </Form.Field>
                          </div>

                          <div className="col-md-12 mb-4 mt-4 text-right col-6">
                              <hr/>
                          </div>

                          <div className="col-md-12">
                              <h4><i className="fas fa-file-alt"></i> Datos del Trabajador</h4>
                              <hr/>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field error={errors?.dateOfAdmission?.[0] ? true : false}>
                                  <label htmlFor="">Fecha de Ingreso <b className="text-red">*</b></label>
                                  <input type="date" 
                                      value={current_work.dateOfAdmission || ""}
                                      qname="dateOfAdmission"
                                      readOnly
                                  />
                                  <label>{errors?.dateOfAdmission?.[0]}</label>
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field>
                                  <label htmlFor="">Ley Social <b className="text-red">*</b></label>
                              <SelectAfp
                                  disabled
                                      name="afpId"
                                      value={current_work.afpId}
                                      onChange={(e, data) => handleInput(data)}
                                  />
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field>
                              <label htmlFor="">N° Cussp</label>
                              <input type="text" 
                                  readOnly
                                  value={current_work.numberOfCussp || ""}
                              />
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                          <Form.Field>
                              <label htmlFor="">Fecha de Afiliación</label>
                              <input type="date" 
                                  value={current_work.affiliationOfDate || ""}
                                  name="affiliationOfDate"
                                  readOnly
                              />
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field>
                                  <label htmlFor="">N° Essalud</label>
                                  <input type="text" 
                                      value={current_work.numberOfEssalud || ""}
                                      readOnly
                                  />
                              </Form.Field>
                          </div>

                          <div className="col-md-6 mb-2">
                              <Form.Field>
                                  <label htmlFor="">Prima Seguro</label>
                                  <Select
                                      options={[
                                          {key: "0", value: false, text: "No Afecto"},
                                          {key: "1", value: true, text: "Afecto"}
                                      ]}
                                      placeholder="Select. Prima Seguro"
                                      value={current_work.isPrimaSeguro}
                                      name="isPrimaSeguro"
                                      disabled
                                  />
                              </Form.Field>
                          </div>
                      </div>
                  </div>
              </div>
        </Form>
    </>
  );
}

// export 
export default InfoGeneral;