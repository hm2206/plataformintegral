import React, { useState, useContext, useEffect } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import atob from 'atob';
import { AppContext } from '../../../contexts/AppContext';
import { SelectCargo } from '../../../components/select/cronograma';
import moment from 'moment';
import Skeletor from 'react-loading-skeleton';
import { Fragment } from 'react';
import BoardSimple from '../../../components/boardSimple';
import NotFoundData from '../../../components/notFoundData';

const Placeholder = () => {
    const datos = [1, 2];
    // render
    return (
        <Fragment>
            <div className="col-md-12"></div>
            {datos.map((d, indexD) => 
                <div className="col-md-6 mb-1" key={`lista-placeholder-d-${indexD}`}>
                    <Skeletor height="200px"/>
                </div>
            )}
        </Fragment>
    )
}

const ItemConfig = ({ obj = {}, index, disabled = false, onUpdate = null }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [edit, setEdit] = useState(false);

    // cambiar form
    const handleInput = ({ name, value }) => {
        setEdit(true);
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const update = async () => {
        let answer = await Confirm('warning', `¿Deseas Actualizar configuración?`, 'Crear');
        if (answer) {
            setCurrentLoading(true);
            let datos = Object.assign({}, form);
            datos._method = 'PUT';
            await unujobs.post(`config_aporte/${obj.id}`, datos)
                .then(async res => {
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    if (typeof onUpdate == 'function') await onUpdate(form, index);
                    setErrors({});
                    setEdit(false);
                })
                .catch(err => {
                    try {
                        let { data } = err.response;
                        if (typeof data != 'object') throw new Error(err.message);  
                        if (typeof data.errors != 'object') throw new Error(data.message);
                        Swal.fire({ icon: 'warning', text: data.message });
                        setErrors(data.errors);
                    } catch (error) {
                        Swal.fire({ icon: 'warning', text: error.message });
                    }
                });
            setCurrentLoading(false);
        }
    }

    // montar componente
    useEffect(() => {
        if (!edit) setForm(JSON.parse(JSON.stringify(obj)));
    }, [edit]);

    // render
    return (
        <div className="card">
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="">Partición Presupuestal</label>
                        <input type="text"
                            className="uppercase"
                            value={obj.cargo && obj.cargo.alias}
                            readOnly
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="">Año</label>
                        <input type="number"
                            value={obj.year || ""}
                            readOnly
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="">UIT</label>
                        <input type="number"
                            value={form.uit || ""}
                            name="uit"
                            step="any"
                            onChange={({ target }) => handleInput(target)}
                            disabled={disabled || current_loading}
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="">Porcentaje (%)</label>
                        <input type="number"
                            step="any"
                            value={form.porcentaje || ""}
                            name="porcentaje"
                            onChange={({ target }) => handleInput(target)}
                            disabled={disabled || current_loading}
                        />
                    </div>

                    <Show condicion={edit}>
                        <div className="col-md-12 text-right">
                            <hr/>
                            <Button color="red" basic 
                                disabled={disabled || current_loading} 
                                onClick={(e) => setEdit(false)}
                            >
                                <i className="fas fa-times"></i>
                            </Button>
                            <Button color="green" basic 
                                onClick={update}
                                loading={current_loading}
                                disabled={disabled}    
                            >
                                <i className="fas fa-save"></i>
                            </Button>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    )
}


const TypeAportacionConfigMax = ({ success, type_aportacion, pathname, query }) => {

    // validar datos
    if (!success) return <NotFoundData/>

    // app
    const app_context = useContext(AppContext);

    // estados
    const [datos, setDatos] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [last_page, setLastPage] = useState(0);
    const [current_error, setCurrentError] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({});
    const [edit, setEdit] = useState(false);
    const [filter_year, setFilterYear] = useState(moment().format('YYYY'));
    const [current_loading, setCurrentLoading] = useState(false);

    // cambiar form
    const handleInput = ({ name, value }) => {
        setEdit(true);
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }
    
    // guardar datos
    const save = async () => {
        let answer = await Confirm('warning', `¿Deseas agregar configuración?`, 'Crear');
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = Object.assign({}, form);
            datos.type_aportacion_id = type_aportacion.id;
            await unujobs.post(`config_aporte`, datos)
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    setFilterYear(form.year || filter_year);
                    setErrors({});
                    setForm({});
                })
                .catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { data } = err.response;
                        if (typeof data != 'object') throw new Error(err.message);  
                        if (typeof data.errors != 'object') throw new Error(data.message);
                        Swal.fire({ icon: 'warning', text: data.message });
                        setErrors(data.errors);
                    } catch (error) {
                        Swal.fire({ icon: 'warning', text: error.message });
                    }
                });
        }
    }

    // obtener configuración aportes
    const getConfigAportes = async (add = false) => {
        setCurrentLoading(true);
        await unujobs.get(`type_aportacion/${type_aportacion.id}/config_aporte?year=${filter_year}`)
            .then(res => {
                let { config_aportes } = res.data;
                setPage(config_aportes.current_page);
                setTotal(config_aportes.total);
                setLastPage(config_aportes.last_page);
                setDatos(add ? [...datos, ...config_aportes.data] : config_aportes.data);
                setCurrentError(false);
            }).catch(err => setCurrentError(true));
        setCurrentLoading(false);
    }

    // actualizar datos
    const handleUpdate = async (obj, index) => {
        let newDatos = JSON.parse(JSON.stringify(datos));
        newDatos[index] = obj;
        setDatos(newDatos);
    }

    // montar datos
    useEffect(() => {
        if (success && filter_year.length >= 4) getConfigAportes();
    }, [filter_year]);


    // render
    return (
        <div className="col-md-12">
            <BoardSimple
                title="Tip. Aportación"
                info={["Configuración Aportación Máxima"]}
                prefix={<BtnBack/>}
                bg="light"
                options={[]}
            >
                <div className="card-body">
                    <Form className="row justify-content-center">
                        <div className="col-md-10">
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">ID-MANUAL <b className="text-red">*</b></label>
                                        <input type="text"
                                            placeholder="Ingrese un identificador unico"
                                            name="key"
                                            value={type_aportacion.key || ""}
                                            readOnly
                                        /> 
                                    </Form.Field>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                        <input type="text"
                                            placeholder="Ingrese una descripción"
                                            name="descripcion"
                                            value={type_aportacion.descripcion || ""}
                                            readOnly
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Porcentaje <b className="text-red">*</b></label>
                                        <input type="number"
                                            placeholder="Ingrese una cantidad porcentual. Ejm 4 = 4%"
                                            name="porcentaje"
                                            value={type_aportacion.porcentaje || ""}
                                            readOnly
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Mínimo</label>
                                        <input type="number"
                                            placeholder="Ingrese un monto mínimo"
                                            name="minimo"
                                            value={type_aportacion.minimo || ""}
                                            readOnly
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Predeterminado</label>
                                        <input type="number"
                                            placeholder="Ingrese un monto predeterminado"
                                            name="default"
                                            value={type_aportacion.default || ""}
                                            readOnly
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Exp Presupuestal</label>
                                        <input type="text"
                                            placeholder="Ingrese una extensión presupuestal"
                                            name="ext_pptto"
                                            value={type_aportacion.ext_pptto || ""}
                                            readOnly
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-12">
                                    <hr/>
                                    <i className="fas fa-cogs"></i> Configuración por Partición Presupuestal
                                    <hr/>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field error={errors.cargo_id && errors.cargo_id[0] || ""}>
                                        <label htmlFor="">Partición Presupuestal</label>
                                        <SelectCargo
                                            name="cargo_id"
                                            value={form.cargo_id}
                                            onChange={(e, obj) => handleInput(obj)}
                                        />
                                        <label>{errors.cargo_id && errors.cargo_id[0] || ""}</label>
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field error={errors.year && errors.year[0] || ""}>
                                        <label htmlFor="">Año</label>
                                        <input
                                            type="number"
                                            placeholder="Ingres el año"
                                            name="year"
                                            value={form.year || ""}
                                            onChange={({ target }) => handleInput(target)}
                                        />
                                        <label>{errors.year && errors.year[0] || ""}</label>
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field error={errors.uit && errors.uit[0] || ""}>
                                        <label htmlFor="">UIT</label>
                                        <input
                                            type="number"
                                            placeholder="Ingres al UIT correspondiente al año"
                                            name="uit"
                                            value={form.uit || ""}
                                            onChange={({ target }) => handleInput(target)}
                                        />
                                        <label>{errors.uit && errors.uit[0] || ""}</label>
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field error={errors.porcentaje && errors.porcentaje[0] || ""}>
                                        <label htmlFor="">Porcentaje(%)</label>
                                        <input
                                            type="number"
                                            placeholder="Ingres al UIT correspondiente al año"
                                            name="porcentaje"
                                            value={form.porcentaje || ""}
                                            onChange={({ target }) => handleInput(target)}
                                        />
                                        <label>{errors.porcentaje && errors.porcentaje[0] || ""}</label>
                                    </Form.Field>
                                </div>

                                <div className="col-md-12 text-right">
                                    <hr/>
                                    <Button color="teal"
                                        onClick={save}
                                    >
                                        <i className="fas fa-save"></i> Guardar
                                    </Button>
                                    <hr/>
                                </div>
                                
                                <div className="col-md-12 mb-4">
                                    <i className="fas fa-list"></i> <b>Lista de configuraciones</b>
                                </div>

                                <div className="col-md-12 m-3">
                                    <input type="number"
                                        name="filter_year"
                                        disabled={current_loading}
                                        value={filter_year || ""}
                                        onChange={({ target }) => setFilterYear(target.value)}
                                    />
                                    <hr/>
                                </div>

                                {/* lista de configuraciones */}
                                {datos.map((d, indexD) =>
                                    <div className="col-md-6 mb-1" key={`list-config-aportacion-${indexD}`}>
                                        <ItemConfig obj={d} 
                                            index={indexD} 
                                            disabled={current_loading}
                                            onUpdate={handleUpdate}
                                        />
                                    </div>
                                )}

                                <Show condicion={!current_loading && !datos.length}>
                                    <div className="col-md-12">
                                        <div className="card card-body">
                                            <div className="text-center">
                                                No hay registros disponibles! 
                                                <button className="btn ml-1 btn-sm btn-outline-primary"
                                                    onClick={(e) => getConfigAportes()}
                                                >
                                                    <i className="fas fa-sync"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Show>

                                <Show condicion={current_loading}>
                                    <Placeholder/>
                                </Show>
                            </div>
                        </div>
                    </Form>
                </div>
            </BoardSimple>
        </div>
    )
}

TypeAportacionConfigMax.getInitialProps = async (ctx) => {
    let { pathname, query } = ctx;
    let id = query.id ? atob(query.id) : '__error';
    let { success, type_aportacion } = await unujobs.get(`type_aportacion/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, type_aportacion: {} }))
    // response
    return { pathname, query, type_aportacion, success };
}

export default TypeAportacionConfigMax;