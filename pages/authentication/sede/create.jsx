import React, { useState, useEffect } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import Router, { useRouter } from 'next/router';
import { Form } from 'semantic-ui-react'
import { Button } from '@/components/ui/button';
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { Confirm } from '../../../services/utils';
import BoardSimple from '../../../components/boardSimple';
import ContentControl from '../../../components/contentControl';


const CreateSede = () => {
    const router = useRouter();
    const { pathname, query } = router;

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!AUTHENTICATE()) return;
    }, []);

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const save = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en guardar los datos?', 'Estoy seguro');
        if (!answer) return false;
        setLoading(true);
        await authentication.post('sede', form)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
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
        setLoading(false);
    }

    return (
        <div className="col-md-12">
            <BoardSimple
                title="Sede"
                info={["Crear Sede"]}
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

            {/* panel de control */}
            <ContentControl>
                <div className="col-lg-2 col-6">
                    <Button
                        className="tw-w-full"
                        disabled={loading}
                        onClick={save}
                    >
                        {loading ? (
                            <><i className="fas fa-spinner fa-spin mr-1"></i> Guardando...</>
                        ) : (
                            <><i className="fas fa-save mr-1"></i> Guardar</>
                        )}
                    </Button>
                </div>
            </ContentControl>
        </div>
    )
}

export default CreateSede;
