import React, { useState, useEffect } from 'react';
import { BtnBack } from '../../../components/Utils';
import Router, { useRouter } from 'next/router';
import { Form } from 'semantic-ui-react'
import ReactSelect from 'react-select';
import { Button } from '@/components/ui/button';
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple'
import atob from 'atob';
import ContentControl from '../../../components/contentControl';
import { Fragment } from 'react';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';


const EditDependencia = () => {
    const router = useRouter();
    const { pathname, query } = router;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [dependencia, setDependencia] = useState({});

    const fetchInitialData = async () => {
        if (!query.id) return;
        setLoading(true);
        const id = atob(query.id);
        await authentication.get(`dependencia/${id}`)
            .then(res => {
                setSuccess(res.data.success);
                const dep = res.data.dependencia || {};
                setDependencia(dep);
                setForm(JSON.parse(JSON.stringify(dep)));
            })
            .catch(err => {
                console.error(err);
                setDependencia({});
            });
        setLoading(false);
    };

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchInitialData();
    }, [query.id]);


    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [edit, setEdit] = useState(false);

    // cambiar dependencia
    const handleInput = ({ name, value }, obj = 'form') => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // actualizar dependencia
    const save = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar los datos?`, 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        await authentication.post(`dependencia/${form.id}?_method=PUT`, form)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setErrors({});
            setEdit(false);
            Router.push(location.href);
        }).catch(async err => {
            try {
                let { data } = err.response;
                if (typeof data != 'object') throw new Error(err.message);
                if (typeof data.errors != 'object') throw new Error(data.message || err.message);
                setErrors(data.errors || {});
                Swal.fire({ icon: 'warning', text: data.message });
            } catch (error) {
                await Swal.fire({ icon: 'error', text: error.message });
            }
        }); 
        setCurrentLoading(false);
    }

    // cancelar
    const handleCancel = () => {
        setEdit(false);
        setForm(JSON.parse(JSON.stringify(dependencia || {})));
    }

    // loading state
    if (loading) {
        return (
            <div className="col-md-12 text-center py-5">
                <i className="fas fa-spinner fa-spin fa-2x"></i>
                <p className="mt-2">Cargando...</p>
            </div>
        );
    }

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    title={<span className="capitalize">Dependencia: {dependencia?.nombre || ""}</span>}
                    info={[`Editar dependencia`]}
                    bg="light"
                    prefix={<BtnBack/>}
                    options={[]}
                >
                    <div className="card-body mt-5">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.nombre && errors.nombre[0] ? true : false}>
                                            <label htmlFor="">Nombre <b className="text-red">*</b></label>
                                            <input type="text" 
                                                name="nombre"
                                                placeholder="Ingrese un nombre"
                                                value={form.nombre || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.nombre && errors.nombre[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.descripcion && errors.descripcion[0] ? true : false}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="descripcion"
                                                value={form.descripcion || ""}
                                                placeholder="Ingrese una descripción de la dependencia"
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.descripcion && errors.descripcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.ubicacion && errors.ubicacion[0] ? true : false}>
                                            <label htmlFor="">Ubicación <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la ubicación"
                                                name="ubicacion"
                                                value={form.ubicacion || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.ubicacion && errors.ubicacion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field  error={errors && errors.type && errors.type[0] ? true : false}>
                                            <label htmlFor="">Tipo <b className="text-red">*</b></label>
                                            <ReactSelect
                                                placeholder="Selec. Tipo de Dependencia"
                                                name="type"
                                                value={[
                                                    { value: 'OTRO', label: 'Otro' },
                                                    { value: 'ESCUELA', label: 'Escuela' },
                                                    { value: 'FACULTAD', label: 'Facultad' },
                                                    { value: 'OFICINA', label: 'Oficina' }
                                                ].find(opt => opt.value === form.type) || null}
                                                options={[
                                                    { value: 'OTRO', label: 'Otro' },
                                                    { value: 'ESCUELA', label: 'Escuela' },
                                                    { value: 'FACULTAD', label: 'Facultad' },
                                                    { value: 'OFICINA', label: 'Oficina' }
                                                ]}
                                                onChange={(selected) => handleInput({ name: 'type', value: selected?.value || '' })}
                                            />
                                            <label>{errors && errors.type && errors.type[0]}</label>
                                        </Form.Field>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </BoardSimple>
            </div>

            {/* panel de control */}
            <Show condicion={edit}>
                <ContentControl>
                    <div className="col-lg-2 col-6">
                        <Button
                            variant="destructive"
                            className="tw-w-full"
                            onClick={handleCancel}
                            disabled={current_loading}
                        >
                            <i className="fas fa-times mr-1"></i> Cancelar
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button
                            className="tw-w-full"
                            disabled={current_loading}
                            onClick={save}
                        >
                            {current_loading ? (
                                <><i className="fas fa-spinner fa-spin mr-1"></i> Actualizando...</>
                            ) : (
                                <><i className="fas fa-sync mr-1"></i> Actualizar</>
                            )}
                        </Button>
                    </div>
                </ContentControl>
            </Show>
        </Fragment>
    )
}

// export 
export default EditDependencia;