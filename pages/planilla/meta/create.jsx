import React, { useContext, useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import { Form, Button } from 'semantic-ui-react'
import { handleErrorRequest, unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { AppContext } from '../../../contexts';
import ContentControl from '../../../components/contentControl';
import BoardSimple from '../../../components/boardSimple'

const CreateMeta = ({ pathname, query }) => {

    // app
    const app_context = useContext(AppContext);
    
    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});

    // manejar estado del form
    const handleInput = ({ name, value }, obj = 'form') => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // guardar datos
    const save = async () => {
        let answer = await Confirm("warning", "¿Estás seguro en guardar los datos?", "Estoy seguro");
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await unujobs.post('meta', form)
        .then(async res => {
            app_context.setCurrentLoading(false)
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({});
        })
        .catch(async err => handleErrorRequest(err, setErrors, () => app_context.setCurrentLoading(false)));
    }

    // renderizar
    return (
        <>
            <div className="col-md-12">
                <BoardSimple
                    prefix={<BtnBack/>}
                    bg="light"
                    title="Metas"
                    info={["Crear Meta presupuestal"]}
                    options={[]}
                >
                    <div className="card-body mt-4">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.metaID && errors.metaID[0] ? true : false}>
                                            <label htmlFor="">MetaID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID de la meta"
                                                name="metaID"
                                                value={form.metaID || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.metaID && errors.metaID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.meta && errors.meta[0] ? true : false}>
                                            <label htmlFor="">Meta <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripcion de la Meta"
                                                name="meta"
                                                value={form.meta || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.meta && errors.meta[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.sectorID && errors.sectorID[0] ? true : false}>
                                            <label htmlFor="">SectorID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID del sector"
                                                name="sectorID"
                                                value={form.sectorID || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.sectorID && errors.sectorID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.sector && errors.sector[0] ? true : false}>
                                            <label htmlFor="">Sector <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción del sector"
                                                name="sector"
                                                value={form.sector || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.sector && errors.sector[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.pliegoID && errors.pliegoID[0] ? true : false}>
                                            <label htmlFor="">PliegoID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID del pliego"
                                                name="pliegoID"
                                                value={form.pliegoID || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.pliegoID && errors.pliegoID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.pliego && errors.pliego[0] ? true : false}>
                                            <label htmlFor="">Pliego <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción del pliego"
                                                name="pliego"
                                                value={form.pliego || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.pliego && errors.pliego[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.unidadID && errors.unidadID[0] ? true : false}>
                                            <label htmlFor="">UnidadID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID de la unidad"
                                                name="unidadID"
                                                value={form.unidadID || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.unidadID && errors.unidadID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.unidad_ejecutora && errors.unidad_ejecutora[0] ? true : false}>
                                            <label htmlFor="">Unidad Ejecutora <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción de la unidad ejecutora"
                                                name="unidad_ejecutora"
                                                value={form.unidad_ejecutora || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.unidad_ejecutora && errors.unidad_ejecutora[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.programaID && errors.programaID[0] ? true : false}>
                                            <label htmlFor="">ProgramaID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID del programa"
                                                name="programaID"
                                                value={form.programaID || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.programaID && errors.programaID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.programa && errors.programa[0] ? true : false}>
                                            <label htmlFor="">Programa <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción del programa"
                                                name="programa"
                                                value={form.programa || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.programa && errors.programa[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.funcionID && errors.funcionID[0] ? true : false}>
                                            <label htmlFor="">FuncionID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID de la funcion"
                                                name="funcionID"
                                                value={form.funcionID || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.funcionID && errors.funcionID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.funcion && errors.funcion[0] ? true : false}>
                                            <label htmlFor="">Funcion <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción de la funcion"
                                                name="funcion"
                                                value={form.funcion || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.funcion && errors.funcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.subProgramaID && errors.subProgramaID[0] ? true : false}>
                                            <label htmlFor="">Sub-ProgramaID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID de la Sub-Programa"
                                                name="subProgramaID"
                                                value={form.subProgramaID || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.subProgramaID && errors.subProgramaID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.sub_programa && errors.sub_programa[0] ? true : false}>
                                            <label htmlFor="">Sub-Programa <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción del Sub-Programa"
                                                name="sub_programa"
                                                value={form.sub_programa || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.sub_programa && errors.sub_programa[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.actividadID && errors.actividadID[0] ? true : false}>
                                            <label htmlFor="">ActividadID <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese el ID de la Actividad"
                                                name="actividadID"
                                                value={form.actividadID || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.actividadID && errors.actividadID[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.actividad && errors.actividad[0] ? true : false}>
                                            <label htmlFor="">Actividad <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese la descripción de la Actividad"
                                                name="actividad"
                                                value={form.actividad || ""}
                                                onChange={(e) => handleInput(e.target)}
                                            />
                                            <label>{errors && errors.actividad && errors.actividad[0]}</label>
                                        </Form.Field>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </BoardSimple>
            </div>
            {/* panel de control */}
            <ContentControl>
                <div className="col-lg-2 col-6">
                    <Button fluid 
                        color="teal"
                        onClick={save}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </ContentControl>
        </>
    )
}

// server
CreateMeta.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let {pathname, query } = ctx;
    // responser
    return { pathname, query };
}

// exportar
export default CreateMeta;