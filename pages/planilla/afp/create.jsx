import React, { useState, useContext, useEffect } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, Confirm, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { AppContext } from '../../../contexts/AppContext';
import { SelectTypeDescuento } from '../../../components/select/cronograma'

const CreateAfp = ({ pathname, query }) => {

    // estados
    const [form, setForm] = useState({ private: 0 });
    const [ley, setLey] = useState({});
    const [block, setBlock] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // app
    const app_context = useContext(AppContext);

    // cambiar input
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // guardar
    const save = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar los datos?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            await unujobs.post('afp', form)
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                setForm({ private: 0 });
                setErrors({});
                setLey({});
            }).catch(err => {
                try {
                    app_context.setCurrentLoading(false);
                    let { data } = err.response;
                    if (typeof data != 'object') throw new Error(err.message);
                    if (typeof data.errors != 'object') throw new Error(data.message || ""); 
                    Swal.fire({ icon: 'warning', text: data.message });
                    setErrors(data.errors);
                } catch (error) {
                    Swal.fire({ icon: 'error', text: error.message });
                }
            });
        }
    }

    // render
    return (
    <div className="col-md-12">
        <Body>
            <div className="card-header">
                <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Ley Social
            </div>

            <div className="card-body">
                <Form className="row justify-content-center mb-5">
                    <div className="col-md-10">
                        <div className="row justify-content-end">
                            <div className="col-md-4 mb-3">
                                <Form.Field error={errors.afp_id && errors.afp_id[0] || false}>
                                    <label htmlFor="">ID-MANUAL</label>
                                    <input type="number"
                                        name="afp_id"
                                        value={form.afp_id || ""}
                                        placeholder="Ingrese un identificador para la Ley Social"
                                        onChange={(e) => handleInput(e.target)}
                                        disabled={current_loading}
                                    />
                                    <label>{errors.afp_id && errors.afp_id[0]}</label>
                                </Form.Field>
                            </div>

                            <div className="col-md-4 mb-3">
                                <Form.Field error={errors.afp && errors.afp[0] || false}>
                                    <label htmlFor="">Descripción</label>
                                    <input type="text"
                                        name="afp"
                                        value={form.afp || ""}
                                        placeholder="Ingrese una descripción de la Ley Social"
                                        onChange={(e) => handleInput(e.target)}
                                        disabled={current_loading}
                                    />
                                    <label>{errors.afp && errors.afp[0]}</label>
                                </Form.Field>
                            </div>

                            <div className="col-md-4 mb-3">
                                <Form.Field error={errors.type_afp_id && errors.type_afp_id[0] || false}>
                                    <label htmlFor="">ID-TIPO-MANUAL</label>
                                    <input type="number"
                                        name="type_afp_id"
                                        value={form.type_afp_id || ""}
                                        placeholder="Ingrese un identificador para el Tipo de Ley Social"
                                        onChange={(e) => handleInput(e.target)}
                                        disabled={current_loading}
                                    />
                                    <label>{errors.type_afp_id && errors.type_afp_id[0]}</label>
                                </Form.Field>
                            </div>

                            <div className="col-md-4 mb-3">
                                <Form.Field error={errors.type_afp && errors.type_afp[0] || false}>
                                    <label htmlFor="">Tipo</label>
                                    <input type="text"
                                        name="type_afp"
                                        value={form.type_afp || ""}
                                        placeholder="Ingrese un descripción para el Tipo de Ley Social"
                                        onChange={(e) => handleInput(e.target)}
                                        disabled={current_loading}
                                    />
                                    <label>{errors.type_afp && errors.type_afp[0]}</label>
                                </Form.Field>
                            </div>

                            <div className="col-md-4 mb-3">
                                <Form.Field error={errors.type_descuento_id && errors.type_descuento_id[0] || false}>
                                    <label htmlFor="">Tip. Descuento</label>
                                    <SelectTypeDescuento
                                        name="type_descuento_id"
                                        value={form.type_descuento_id || ""}
                                        disabled={block || current_loading}
                                        onChange={(e, obj) => handleInput(obj)}
                                    />
                                    <label>{errors.type_descuento_id && errors.type_descuento_id[0]}</label>
                                </Form.Field>
                            </div>

                            <div className="col-md-4 mb-3">
                                <Form.Field>
                                    <label htmlFor="">Porcentaje (%)</label>
                                    <input type="number"
                                        name="porcentaje"
                                        value={form.porcentaje || ""}
                                        placeholder="Ingrese el porcentaje"
                                        onChange={(e) => handleInput(e.target)}
                                        disabled={current_loading}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-4 mb-3">
                                <Form.Field>
                                    <label htmlFor="">Modo</label>
                                    <Select
                                        placeholder="Select. Entidad"
                                        options={[
                                            { key: "private", value: true, text: "Privado" },
                                            { key: "no-private", value: false, text: "Público" }
                                        ]}
                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.value ? 1 : 0 })}
                                        value={form.private ? true : false}
                                        name="private"
                                        disabled={current_loading}
                                    />
                                </Form.Field>
                            </div>

                            <Show condicion={form.private}>
                                <h5 className="col-md-12 mb-3">
                                    <hr/>
                                    <i className="fas fa-cogs"></i> Configuración Aporte Obligatorio
                                    <hr/>
                                </h5>

                                <div className="col-md-8 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Tip. Descuento</label>
                                        <SelectTypeDescuento
                                            name="aporte_descuento_id"
                                            value={form.aporte_descuento_id || ""}
                                            disabled={block || current_loading}
                                            onChange={(e, obj) => handleInput(obj)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Aporte (%)</label>
                                        <input type="number"
                                            name="aporte"
                                            placeholder="Ingrese el Porcentaje"
                                            value={form.aporte || ""}
                                            onChange={(e) => handleInput(e.target)}
                                            disabled={current_loading}
                                        />
                                    </Form.Field>
                                </div>

                                <h5 className="col-md-12 mb-3">
                                    <hr/>
                                    <i className="fas fa-cogs"></i> Configuración Prima Seguro
                                    <hr/>
                                </h5>

                                <div className="col-md-4 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Tip. Descuento</label>
                                        <SelectTypeDescuento
                                            name="prima_descuento_id"
                                            value={form.prima_descuento_id || ""}
                                            disabled={block || current_loading}
                                            onChange={(e, obj) => handleInput(obj)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Prima (%)</label>
                                        <input type="number"
                                            name="prima"
                                            placeholder="Ingrese el Porcentaje"
                                            value={form.prima || ""}
                                            onChange={(e) => handleInput(e.target)}
                                            disabled={current_loading}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Prima Limite</label>
                                        <input type="number"
                                            name="prima_limite"
                                            placeholder="Ingrese el monto Limite de la Prima Seguro"
                                            value={form.prima_limite || ""}
                                            onChange={(e) => handleInput(e.target)}
                                            disabled={current_loading}
                                        />
                                    </Form.Field>
                                </div>
                            </Show>

                            <div className="col-md-12">
                                <hr/>
                            </div>

                            <div className="col-md-2">
                                <Button color="teal" fluid
                                    onClick={save}
                                    disabled={current_loading}
                                    current_loading={current_loading}
                                >
                                    <i className="fas fa-save"></i> Guardar
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </Body>
    </div>);
}

// precargador server
CreateAfp.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query }; 
}

// exportar
export default CreateAfp;

    
