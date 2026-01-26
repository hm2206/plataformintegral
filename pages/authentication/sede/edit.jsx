import React, { Fragment, useEffect, useState } from 'react'
import { Form, Image } from 'semantic-ui-react';
import ReactSelect from 'react-select';
import Router, { useRouter } from 'next/router';
import { authentication } from '../../../services/apis';
import { backUrl, Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import { Button } from '@/components/ui/button';
import atob from 'atob';
import Show from '../../../components/show';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';

const EditSede = () => {
    const router = useRouter();
    const { pathname, query } = router;

    // estados de carga
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [edit, setEdit] = useState(false);

    // datos
    const [sede, setSede] = useState({});
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});

    // cargar datos iniciales
    const fetchSede = async () => {
        if (!query.id) return;
        setLoading(true);
        const id = atob(query.id);
        await authentication.get(`sede/${id}`)
            .then(res => {
                const sedeData = res.data.sede || {};
                setSede(sedeData);
                setForm(JSON.parse(JSON.stringify(sedeData)));
            })
            .catch(err => {
                console.error(err);
                setSede({});
            });
        setLoading(false);
    };

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchSede();
    }, [query.id]);

    // manejar inputs
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // guardar cambios
    const save = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en guardar los datos?', 'Estoy seguro');
        if (!answer) return false;
        setSaving(true);
        await authentication.post(`sede/${sede.id}?_method=PUT`, form)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            setEdit(false);
            Router.push(location.href);
        })
        .catch(err => {
            try {
                let response = JSON.parse(err.message);
                Swal.fire({ icon: 'warning', text: response.message });
                setErrors(response.errors || {});
            } catch (error) {
                Swal.fire({ icon: 'error', text: err.message });
            }
        });
        setSaving(false);
    }

    // cancelar edición
    const handleCancel = () => {
        setEdit(false);
        setForm(JSON.parse(JSON.stringify(sede)));
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

    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    title={<span>Sede: <b className="capitalize">{sede?.descripcion || ''}</b></span>}
                    info={["Editar Sede"]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">
                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors?.descripcion?.[0] ? true : false}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                name="descripcion"
                                                placeholder="Ingrese la descripción de la Sede"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.descripcion || ""}
                                            />
                                            <label>{errors?.descripcion?.[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors?.direccion?.[0] ? true : false}>
                                            <label htmlFor="">Dirección <b className="text-red">*</b></label>
                                            <textarea
                                                name="direccion"
                                                placeholder="Ingrese la dirección"
                                                onChange={(e) => handleInput(e.target)}
                                                value={form.direccion || ""}
                                            />
                                            <label>{errors?.direccion?.[0]}</label>
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
                            disabled={saving}
                            onClick={handleCancel}
                        >
                            <i className="fas fa-times mr-1"></i> Cancelar
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button
                            className="tw-w-full"
                            disabled={saving}
                            onClick={save}
                        >
                            {saving ? (
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

export default EditSede;
