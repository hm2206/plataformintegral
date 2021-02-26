import React, { useEffect, useState } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, List } from 'semantic-ui-react'
import { authentication, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';
import atob from 'atob';
import BoardSimple from '../../../components/boardSimple';
import UpdateModule from '../../../components/authentication/updateModule';


const SystemModule = ({ pathname, query, success, system }) => {

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);

    // manejador de cambio de form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // guardar los datos
    const save = async () => {
        let answer = await Confirm("warning", `¿Deseas guardar los datos?`, 'Guardar');
        if (!answer) return false;
        setCurrentLoading(true);
        let data = Object.assign({}, form);
        data.system_id = system.id;
        await authentication.post(`module`, data)
        .then(async res => {
            let { message, module } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
            setDatos([...datos, module]);
        }).catch(async err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    // obtener modulos
    const getModules = async (add = false) => {
        setCurrentLoading(true);
        await authentication.get(`system/${system.id}/module`)
        .then(res => {
            let { modules } = res.data;
            setDatos(add ? [...datos, ...modules.data] : modules.data);
            setCurrentLastPage(modules.lastPage || 0);
            setCurrentTotal(modules.total || 0);
        }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // actualizar datos
    const handleUpdate = async (index, data) => {
        let newDatos = JSON.parse(JSON.stringify(datos || []));
        newDatos[index] = data;
        setDatos(newDatos);
    }

    // primera carga
    useEffect(() => {
        getModules();
    }, []);

    // next page
    useEffect(() => {
        if (current_page > 1) getModules(true);
    }, [current_page]);

    // renderizar
    return (
            <div className="col-md-12">
                <BoardSimple
                    title={<span>Sistema: {system && system.name || ""}</span>}
                    info={[`Agregar módulos`]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <Form className="card-body">
                        <div className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-12">
                                        <h4><i className="fas fa-box"></i> Datos de Sistema</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Nombre</label>
                                            <input type="text" 
                                                value={system.name || ""}
                                                readOnly
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Correo</label>
                                            <input type="text"
                                                value={system.email || ""}
                                                readOnly
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 mt-5">
                                        <hr/>
                                        <label><i className="fas fa-plus"></i> Agregar Modulo a <b>"{system.name || ""}"</b></label>
                                        <hr/>
                                    </div>

                                    <div className="col-md-6">
                                        <Form.Field error={errors.name && errors.name[0] ? true : false}>
                                            <label>Nombre <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese un nombre"
                                                name="name"
                                                value={form.name || ""}
                                                onChange={(e) => handleInput(e.target)} 
                                                disabled={current_loading}
                                            />
                                            <label>{errors.name && errors.name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6">
                                        <Form.Field error={errors.description && errors.description[0] ? true : false}>
                                            <label>Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción"
                                                name="description"
                                                value={form.description || ""}
                                                onChange={(e) => handleInput(e.target)} 
                                                disabled={current_loading}
                                            />
                                            <label>{errors.description && errors.description[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 text-right mt-3">
                                        <hr/>
                                        <Button color="teal"
                                            loading={current_loading}
                                            disabled={current_loading}
                                            onClick={save}
                                        >
                                            <i className="fas fa-save"></i> Guardar
                                        </Button>
                                    </div>

                                    <div className="col-md-12 mb-3 mt-5">
                                        <hr/>
                                        <label><i className="fas fa-list"></i> Modulos de <b>"{system.name || ""}"</b></label>
                                        <hr/>
                                    </div>

                                    <div className="col-md-12">
                                        <List divided verticalAlign='middle'>
                                            {datos.map((obj, indexM) => 
                                                <UpdateModule
                                                    module={obj}
                                                    key={`list-system-module-${indexM}`}
                                                    onUpdate={(data) => handleUpdate(indexM, data)}
                                                />
                                            )}
                                        </List>    
                                    </div>

                                    <Show condicion={!current_loading}>
                                        <div className="col-md-12">
                                            <Button fluid
                                                disabled={!(current_last_page >= (current_page + 1))}
                                                onClick={(e) => setCurrentPage(current_page + 1)}
                                            >
                                                <i className="fas fa-arrow-down"></i> Obtener más datos
                                            </Button>
                                        </div>
                                    </Show>
                                </div>
                            </div>
                        </div>
                    </Form>
                </BoardSimple>
            </div>
    )
}
    
// server
SystemModule.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx
    let id = atob(query.id) || '__error';
    let { success, system } = await authentication.get(`system/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, system: {} }))
    // response
    return { pathname, query, success, system };
}

// exportar
export default SystemModule;