import React, { Fragment, useContext, useState, useEffect } from 'react';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import moment from 'moment';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import currencyFormatter from 'currency-formatter';
import Show from '../show';
import Anexos from './anexos';
import Router from 'next/dist/client/router';
import CierreProject from './cierreProject';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';
import Skeleton from 'react-loading-skeleton';
import InfoArea from './infoArea';
import { Input, FormField, Button, Form } from 'semantic-ui-react';
import { AppContext } from '../../contexts';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import { SelectTypeProject } from '../select/project_tracking';

const Placeholder = () => {
    const datos = [1, 2, 3, 4];
    return datos.map(d => 
        <tr key={`list-placeholder-${d}`}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>
    )
}

const states = {
    START: {
        text: 'INICIO',
        color: 'primary'
    },
    EXECUTE: {
        text: 'EJECUCIÓN',
        color: 'success'
    },
    PREOVER: {
        text: 'PRE CIERRE',
        color: 'warning'
    },
    OVER: {
        text: 'CERRADO',
        color: 'white'
    }
};


const TabDatos = () => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project, financiamiento, dispatch, edit, setEdit } = useContext(ProjectContext);
    const isProject = Object.keys(project || {}).length;

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [option, setOption] = useState("");
    const current_status = states[project.state] || {};

    // obtener financiamiento
    const getFinanciamiento = async () => {
        setCurrentLoading(true);
        await projectTracking.get(`project/${project.id}/financiamiento`)
        .then(res => {
            let { data } = res;
            dispatch({ 
                type: projectTypes.SET_FINANCIAMIENTOS, 
                payload: {
                    data: data.financiamiento, 
                    total_monetario: data.total_monetario, 
                    total_no_monetario: data.total_no_monetario, 
                    total_porcentaje_monetario: data.total_porcentaje_monetario, 
                    total_porcentaje_no_monetario: data.total_porcentaje_no_monetario,
                    total: data.total,
                }
            })
        }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const handleAddKeyword = async () => {
        let { value } = await Swal.fire({
            title: 'Nueva palabra clave',
            input: 'text',
            inputLabel: 'Palabra Clave',
            inputPlaceholder: 'Ingrese la palabra clave'
        });
        if (!value) return false;
        let newKeywords = [...form.keywords, value];
        setForm({ ...form, keywords: newKeywords });
    }

    const handleDeleteKeyword = (index) => {
        let newKeywords = [...form.keywords || []];
        newKeywords.splice(index, 1);
        setForm({ ...form, keywords: newKeywords });
    }

    const saveProject = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar los proyecto?`);
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        let payload = Object.assign({}, form);
        payload.keywords = JSON.stringify(form.keywords);
        await projectTracking.post(`project/${project.id}/update`, payload)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            dispatch({ type: projectTypes.SET_PROJECT, payload: form });
            setEdit(false);
            Router.push(location.href);
        }).catch(err => handleErrorRequest(err, setErrors, app_context.setCurrentLoading(false)));
    }

    const settingForm = () => {
        setForm(JSON.parse(JSON.stringify(project)));
    }

    useEffect(() => {
        if (project.id) getFinanciamiento();
    }, []);

    useEffect(() => {
        if (project.id) settingForm();
    }, [ project]);

    useEffect(() => {
        if (!edit) settingForm();
    }, [edit])

    // render
    return (
    <Fragment>
        <Form className="table-responsive font-13">
            <table className="table mb-4 table-bordered">
                <thead >
                    <tr>
                        <td className="uppercase" width="23%"><b>Código: </b></td>
                        <td colSpan="2">
                            {project?.code}
                            <Show condicion={project?.state != 'OVER' && !edit}>
                                <span className="close cursor-pointer"
                                    onClick={() => setEdit(true)}
                                >
                                    <i className={`fas fa-edit fa-sm text-dark`}></i>
                                </span>
                            </Show>
                        </td>
                    </tr>
                    {/* tipo de proyecto */}
                    <tr>
                        <td className="uppercase"><b>Tipo Proyecto: </b></td>
                        <td colSpan="2">
                            <Show condicion={edit}
                                predeterminado={<span className="uppercase">{project?.type_project?.name || ""}</span>}
                            >
                                <FormField error={errors?.type_project_id?.[0] ? true : false}>
                                    <SelectTypeProject
                                        name="type_project_id"
                                        value={form?.type_project_id}
                                        onChange={(e, obj) => handleInput(obj)}
                                    />
                                    <label>{errors?.title?.[0]}</label>
                                </FormField>
                            </Show>
                        </td>
                    </tr>
                    {/* titulo */}
                    <Show condicion={edit}>
                        <tr>
                            <td className="uppercase"><b>Titulo: </b></td>
                            <td colSpan="2">
                                <FormField error={errors?.title?.[0] ? true : false}>
                                    <input type="text"
                                        value={form.title || ""}
                                        onChange={(e) => handleInput(e.target)}
                                        name="title"
                                    />
                                    <label>{errors?.title?.[0]}</label>
                                </FormField>
                            </td>
                        </tr>
                    </Show>
                    <tr>
                        <td className="uppercase"><b>Resolución: </b></td>
                        <td colSpan="2" className="uppercase">
                            <Show condicion={edit}
                                predeterminado={project?.resolucion}
                            >
                                <FormField error={errors?.resolucion?.[0] ? true : false}>
                                    <input type="text"
                                        value={form.resolucion || ""}
                                        onChange={(e) => handleInput(e.target)}
                                        name="resolucion"
                                    />
                                    <label>{errors?.resolucion?.[0]}</label>
                                </FormField>
                            </Show>
                        </td>
                    </tr>
                    {/* objectivo general */}
                    <Show condicion={edit}>
                        <tr>
                            <td className="uppercase"><b>Objectivo General: </b></td>
                            <td colSpan="2">
                                <FormField error={errors?.general_object?.[0] ? true : false}>
                                    <textarea
                                        value={form.general_object || ""}
                                        onChange={(e) => handleInput(e.target)}
                                        name="general_object"
                                    />
                                    <label>{errors?.general_object?.[0]}</label>
                                </FormField>
                            </td>
                        </tr>
                    </Show>
                    {/* linea de investigacion */}
                    <Show condicion={!edit}>
                        <tr>
                            <td className="uppercase"><b>Líneas de Investigación: </b></td>
                            <td colSpan="2">
                                <InfoArea/>
                            </td>
                        </tr>
                    </Show>
                    {/* fecha de inicio */}
                    <Show condicion={edit}>
                        <tr>
                            <td className="uppercase"><b>Fecha de inicio: </b></td>
                            <td colSpan="2">
                                <FormField error={errors?.date_start?.[0] ? true : false}>
                                    <input type="date"
                                        value={form.date_start || ""}
                                        onChange={(e) => handleInput(e.target)}
                                        name="date_start"
                                    />
                                    <label>{errors?.date_start?.[0]}</label>
                                </FormField>
                            </td>
                        </tr>
                    </Show>
                    <tr>
                        <td className="uppercase"><b>Duración: </b></td>
                        <td colSpan="2">
                            <Show condicion={edit}
                                predeterminado={<span className="uppercase">{project?.duration} meses</span>}
                            >
                                <FormField error={errors?.duration?.[0] ? true : false}>
                                    <input type="text"
                                        value={form.duration || ""}
                                        onChange={(e) => handleInput(e.target)}
                                        name="duration"
                                    />
                                    <label>{errors?.duration?.[0]}</label>
                                </FormField>
                            </Show>
                        </td>
                    </tr>
                    <tr>
                        <td className="uppercase"><b>Costo del Proyecto: </b></td>
                        <td colSpan="2">
                            <Show condicion={edit}
                                predeterminado={<b className="uppercase">{currencyFormatter.format(project?.monto || 0, { code: 'PEN' })}</b>}
                            >
                                <FormField error={errors?.monto?.[0] ? true : false}>
                                    <Input type="number"
                                        step="any"
                                        fluid
                                        value={form.monto || ""}
                                        onChange={(e) => handleInput(e.target)}
                                        name="monto"
                                        icon="database" 
                                        iconPosition='left'
                                    />
                                    <label>{errors?.monto?.[0]}</label>
                                </FormField>
                            </Show>
                        </td>
                    </tr>
                    {/* palabras claves */}
                    <Show condicion={edit}>
                        <tr>
                            <td className="uppercase"><b>Palabras Claves: </b></td>
                            <td colSpan="2">
                                <FormField error={errors?.keywords?.[0] ? true : false}>
                                    <div className="mb-2">
                                        {form?.keywords?.map((k, indexK) => 
                                            <span className="badge badge-sm badge-dark mr-1 mb-1" 
                                                key={`list-keywords-${indexK}`}
                                            >
                                                {k}
                                                <i className="ml-1 fas fa-times cursor-pointer"
                                                    onClick={(e) => handleDeleteKeyword(indexK)}
                                                />
                                            </span>
                                        )}
                                        <span className="badge badge-light mb-1 cursor-pointer"
                                            onClick={handleAddKeyword}
                                        >
                                            <i className="fas fa-plus"></i>
                                        </span>
                                    </div>
                                    <label>{errors?.keywords?.[0]}</label>
                                </FormField>
                            </td>
                        </tr>
                    </Show>
                    {/* mostrar datos cuando no se edita */}
                    <Show condicion={!edit}>
                        <tr>
                            <td className="uppercase"><b>Investigador Principal: </b></td>
                            <td colSpan="2">
                                <span className="uppercase">{project?.principal?.person?.fullname || ""}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="uppercase"><b>ESTADO: </b></td>
                            <td colSpan="2">
                                <Show condicion={isProject}>
                                    <b className={`uppercase && badge badge-${current_status?.color}`}>{current_status?.text}</b>
                                </Show> 
                            </td>
                        </tr>
                        <Show condicion={project.state == 'PREOVER'}>
                            <tr>
                                <td className="uppercase">
                                    <b>Informe de Cierre</b>
                                </td>
                                <td colSpan="2">
                                    <button className="btn btn-sm btn-outline-dark"
                                        onClick={(e) => setOption("cierre")}
                                    >
                                        Cerrar Proyecto <i className="fas fa-arrow-down"></i>
                                    </button>
                                </td>
                            </tr>
                        </Show>

                        <Show condicion={project?.state == 'OVER'}>
                            <tr>
                                <td className="uppercase">
                                    <b>Resolución de Cierre</b>
                                </td>
                                <td colSpan="2" className="uppercase">
                                    {project?.cierre_resolucion}
                                </td>
                            </tr>
                            <tr>
                                <td className="uppercase">
                                    <b>Motivo de Cierre</b>
                                </td>
                                <td colSpan="2" className="uppercase">
                                    {project?.cierre_motivo}
                                </td>
                            </tr>
                        </Show>
                        <tr>
                            <td className="uppercase"><b>ANEXOS: </b></td>
                            <td colSpan="2">
                                <a href="#" className="font-14"
                                    onClick={(e) => setOption("anexos")}
                                >
                                    <i className="fas fa-paperclip"></i>
                                </a>
                            </td>
                        </tr>
                    </Show>
                </thead>
                <tbody>
                    <Show condicion={edit}
                        predeterminado={
                            <tr className="text-center font-14">
                                <td width="26%">
                                    <b>Inicio del proyecto</b>
                                    <div>{moment(project?.date_start).format('DD/MM/YYYY')}</div>
                                </td>
                                <td width="26%">
                                    <b>Duración (Meses)</b>
                                    <div>{project?.duration}</div>
                                </td>
                                <td width="26%">
                                    <b>Fin del proyecto</b>
                                    <div>{moment(project?.date_over).format('DD/MM/YYYY')}</div>
                                </td>
                            </tr>
                        }
                    >
                        <tr>
                            <td colSpan="3">
                                <div className="text-right w-100">
                                    <Button color="red" basic
                                        onClick={() => setEdit(false)}
                                    >
                                        <i className="fas fa-times"></i> Cancelar
                                    </Button>

                                    <Button color="blue" onClick={saveProject}>
                                        <i className="fas fa-sync"></i> Actualizar
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    </Show>
                </tbody>
            </table>
            {/* financiamiento */}
            <Show condicion={!edit}>
                <div><hr/></div>
                <h4 className="uppercase font-12">Financiamiento</h4>
                <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                        <thead className="text-center uppercase">
                            <tr>
                                <th rowSpan="2">Fuentes de Financiamientos</th>
                                <th colSpan="3">Monto (S/.)</th>
                                <th colSpan="2">Porcentaje (%)</th>
                            </tr>
                            <tr>
                                <th>Monetario</th>
                                <th>No Monetario</th>
                                <th>Total</th>
                                <th>Monetario</th>
                                <th>No Monetario</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show condicion={!current_loading}
                                predeterminado={<Placeholder/>}
                            >
                                {financiamiento?.data?.map((f, indexF) => 
                                    <tr key={`financiamiento-${indexF}`}>
                                        <th className="text-center" title={f.name}>{f.ext_pptto}</th>
                                        <th className="text-right">{currencyFormatter.format(f?.monetario || 0, { code: 'PEN' })}</th>
                                        <th className="text-right">{currencyFormatter.format(f?.no_monetario || 0, { code: 'PEN' })}</th>
                                        <th className="text-right">{currencyFormatter.format(f?.total || 0, { code: 'PEN' })}</th>
                                        <th className="text-right">{f?.porcentaje_monetario || 0}%</th>
                                        <th className="text-right">{f?.porcentaje_no_monetario || 0}%</th>
                                    </tr>
                                )}
                                <tr>
                                    <th className="text-center">Total</th>
                                    <th className="text-right">{currencyFormatter.format(financiamiento?.total_monetario || 0, { code: 'PEN' })}</th>
                                    <th className="text-right">{currencyFormatter.format(financiamiento?.total_no_monetario || 0, { code: 'PEN' })}</th>
                                    <th className="text-right">{currencyFormatter.format(financiamiento?.total || 0, { code: 'PEN' })}</th>
                                    <th className="text-right">{financiamiento?.total_porcentaje_monetario || 0}%</th>
                                    <th className="text-right">{financiamiento?.total_porcentaje_no_monetario || 0}%</th>
                                </tr>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </Show>
        </Form>

        <Show condicion={option == 'anexos'}>
            <Anexos
                object_id={project.id}
                object_type={'App/Models/Project'}
                isClose={(e) => setOption("")}
            />
        </Show>

        <Show condicion={option == 'cierre'}>
            <CierreProject
                isClose={(e) => setOption("")}
                afterSave={async (e) => {
                    let { push, pathname, query } = Router;
                    await push({ pathname, query });
                    setOption("");
                }}
            />
        </Show>
    </Fragment>)
}

export default TabDatos;