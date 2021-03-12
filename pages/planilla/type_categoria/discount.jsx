import React, { Fragment, useContext, useEffect, useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import {  Confirm } from '../../../services/utils';
import { Form, Button, List } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { SelectPlanilla, SelectTypeCategoriaTypeDescuento } from '../../../components/select/cronograma'
import { AUTHENTICATE } from '../../../services/auth';
import atob from 'atob';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../../components/boardSimple';
import NotFoundData from '../../../components/notFoundData';

const PlaceholderInput = ({ height = '38px' }) => <Skeleton height={height}/>

const PlaceholderCategorias = () => {

    const array = [1, 2, 3, 4, 5, 6 ,7];

    return <Fragment>
        {array.map(a => 
            <div className="col-md-12 mb-2" key={`iter-placeholder-categoria-${a}`}>
                <div className="row">
                    <div className="col-md-10">
                        <PlaceholderInput/>
                    </div>
                    <div className="col-md-1">
                        <PlaceholderInput/>
                    </div>
                    <div className="col-md-1">
                        <PlaceholderInput/>
                    </div>
                </div>
            </div>    
        )}
    </Fragment>
}

const  DiscountTypeCategoria = ({ success, query, pathname, type_categoria }) => {

    // validar datos
    if (!success) return <NotFoundData/>

    // app
    const app_context = useContext(AppContext);

    // estado
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [categorias, setCategorias] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_loading, setCurrentLoading] = useState(false);
    const [block, setBlock] = useState(false);
    const [edit, setEdit] = useState(false);
    const [current, setCurrent] = useState({});

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors)
    }

    // obtener categorias 
    const getCategorias = async (add = false) => {
        setCurrentLoading(true);
        await unujobs.get(`type_categoria/${type_categoria.id}/type_descuento/${form.planilla_id}?page=${current_page}`)
            .then(async res => {
                let { success, message, type_descuentos } = res.data;
                if (!success) throw new Error(message);
                setCategorias(add ? [...categorias, ...type_descuentos.data] : type_descuentos.data);
                if (type_descuentos.last_page >= current_page + 1) setCurrentPage(current_page + 1);
            }).catch(err => console.log(err.message));
            setCurrentLoading(false);
    }

    // cambio de planilla
    useEffect(() => {
        if (form.planilla_id) {
            setCategorias([]);
            getCategorias();
        }
    }, [form.planilla_id]);

    // obtener categorias al cambiar de page
    useEffect(() => {
        if (current_page > 1) getCategorias(true);
    }, [current_page]);

    const handleInputCategoria = ({ value }, obj, index) => {
        let newCategorias = JSON.parse(JSON.stringify(categorias));
        obj.monto = value;
        newCategorias[index] = obj;
        setCategorias(newCategorias);
    }

    const handleEdit = (obj, index, cancel = false) => {
        obj._edit = obj._edit ? false : true;
        obj.monto = cancel ? current.monto : obj.monto;
        let newCategorias = JSON.parse(JSON.stringify(categorias));
        newCategorias[index] = obj;
        setCategorias(newCategorias);
        setCurrent(cancel ? {} : JSON.parse(JSON.stringify(obj)));
        setEdit(obj._edit);
    }

    const saveCategoria = async () => {
        app_context.setCurrentLoading(true);
        let datos = Object.assign({}, form);
        datos.type_categoria_id = type_categoria.id;
        await unujobs.post('planilla_type_descuento', datos)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            Swal.fire({ icon: 'success', text: message });
            setForm({});
            setForm({ planilla_id: datos.planilla_id });
        }).catch(err => {
            try {
                app_context.setCurrentLoading(false);
                let { errors, message } = err.response.data;
                setErrors(errors);
                Swal.fire({ icon: 'warning', text: 'Datos incorrectos!' });
            } catch (error) {
                Swal.fire({ icon: "error", text: err.message });
            }
        });
    }

    const deleteCategoria = async (id) => {
        let answer = await Confirm("warning", `¿Estas seguro en eliminar la configuración?`, "Eliminar");
        if (answer) {
            setBlock(true);
            app_context.setCurrentLoading(true);
            await unujobs.post(`planilla_type_descuento/${id}`, { _method: 'DELETE' })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                getCategorias()
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
            setBlock(false)
        }
    }

    const updateCategoria = async (obj) => {
        setCurrentLoading(true);
        setBlock(true);
        app_context.setCurrentLoading(true);
        obj._method = 'PUT';
        await unujobs.post(`planilla_type_descuento/${obj.id}`, obj)
        .then(res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            Swal.fire({ icon: 'success', text: message });
            getCategorias();
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
        setBlock(false);
        setEdit(false);
    }

        return (
            <div className="col-md-12">
                <BoardSimple
                    title="Tip. Categoría"
                    info={["Configurar Descuento de Tip. Categoría"]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <Form className="card-body mt-4">
                        <div className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-start">
                                    <div className="col-md-8 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Descripción</label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="descripcion"
                                                value={type_categoria.descripcion || ""}
                                                readOnly
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Dedicación</label>
                                            <input type="text"
                                                placeholder="Ingrese la dedicación"
                                                name="dedicacion"
                                                value={type_categoria.dedicacion || ""}
                                                readOnly
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                        <div className="mb-4"><i className="fas fa-plus"></i> Agregar Tip. Descuento</div>
                                        <SelectPlanilla
                                            name="planilla_id"
                                            value={form.planilla_id}
                                            onChange={(e, obj) => handleInput(obj)}
                                        />
                                        <hr/>
                                    </div>

                                    <div className="col-md-8 mb-2">
                                        <SelectTypeCategoriaTypeDescuento
                                            type_categoria_id={type_categoria.id}
                                            planilla_id={form.planilla_id}
                                            refresh={form.planilla_id}
                                            disabled={!form.planilla_id}
                                            name="type_descuento_id"
                                            execute={false}
                                            value={form.type_descuento_id}
                                            except={1}
                                            onChange={(e, obj) => handleInput(obj)}
                                        />
                                        <label>{errors.type_descuento_id && errors.type_descuento_id[0]}</label>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Form.Field error={errors.monto && errors.monto[0] || false}>
                                            <input type="number"
                                                name="monto"
                                                value={form.monto || ""}
                                                placeholder="Ingrese el monto"
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors.monto && errors.monto[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 mt-3 text-right">
                                        <hr/>
                                        <Button color="teal"
                                            disabled={!form.type_descuento_id}
                                            onClick={saveCategoria}
                                        >
                                            <i className="fas fa-save"></i> Guardar
                                        </Button>
                                    </div>

                                    <Show condicion={form.planilla_id}>
                                        <div className="col-md-12 mt-4">
                                            <hr/>
                                            <i className="fas fa-coins"></i> Lista de Tip. Descuentos
                                            <hr/>
                                        </div>

                                        <div className="col-md-12">
                                            <Show condicion={!current_loading}
                                                predeterminado={<PlaceholderCategorias/>}
                                            >
                                                <List divided verticalAlign='middle'>
                                                    {categorias.map((obj, index) => 
                                                        <List.Item key={`list-categoria-${obj.id}`}>
                                                            <List.Content>
                                                                <div className="row">
                                                                    <div className="col-md-5 uppercase mb-2">
                                                                        <b>{obj.key} .- {obj.descripcion}</b>
                                                                    </div>
                                                                    <div className="col-md-3 mb-2">
                                                                        <Show condicion={!obj._edit}>
                                                                            <span className="badge badge-dark">{obj.monto}</span>
                                                                        </Show>
                                                                        <Show condicion={obj._edit}>
                                                                            <input type="number"
                                                                                name="monto"
                                                                                disabled={block}
                                                                                value={obj.monto || ""}
                                                                                placeholder="ingrese un monto"
                                                                                onChange={(e) => handleInputCategoria(e.target, obj, index)}
                                                                            />
                                                                        </Show>
                                                                    </div>

                                                                    <div className="col-md-4 text-right mb-2">
                                                                        <Show condicion={!obj._edit}>
                                                                            <Button 
                                                                                className="mt-1"
                                                                                title="Editar"
                                                                                color='green'
                                                                                basic
                                                                                disabled={edit || block}
                                                                                onClick={(e) => handleEdit(obj, index)}
                                                                            >
                                                                                <i className={`fas fa-pencil-alt`}></i>
                                                                            </Button>

                                                                            <Button color={'red'}
                                                                                className="mt-1"
                                                                                basic
                                                                                title="Eliminar"
                                                                                disabled={edit || block}
                                                                                onClick={(e) => deleteCategoria(obj.id)}
                                                                            >
                                                                                <i className={`fas fa-trash`}></i>
                                                                            </Button>
                                                                        </Show>

                                                                        <Show condicion={obj._edit}>
                                                                            <Button color={'green'}
                                                                                className="mt-1"
                                                                                title="Guardar"
                                                                                disabled={block}
                                                                                onClick={(e) => updateCategoria(obj)}
                                                                            >
                                                                                <i className={`fas fa-save`}></i>
                                                                            </Button>

                                                                            <Button color={'red'}
                                                                                className="mt-1"
                                                                                title="Cancelar"
                                                                                disabled={block}
                                                                                onClick={(e) => handleEdit(obj, index, true)}
                                                                            >
                                                                                <i className={`fas fa-times`}></i>
                                                                            </Button>
                                                                        </Show>
                                                                    </div>
                                                                </div>
                                                            </List.Content>
                                                        </List.Item>
                                                    )}
                                                </List>    
                                            </Show>

                                            {/* no hay registros */}
                                            <Show condicion={!current_loading && !categorias.length}>
                                                <div className="text-center">
                                                    No hay registros disponibles
                                                </div>
                                            </Show>
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

// server rendering
DiscountTypeCategoria.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    // request 
    let id = atob(query.id) || '__error';
    let { success, type_categoria } = await unujobs.get(`type_categoria/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, type_categoria: {} }));
    return { query, pathname, success, type_categoria }
}

// exportar
export default DiscountTypeCategoria;

