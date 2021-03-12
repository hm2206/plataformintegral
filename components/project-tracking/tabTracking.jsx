import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import AddTeam from './addTeam';
import Show from '../show';
import { projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { Confirm } from '../../services/utils';
import { AppContext } from '../../contexts/AppContext';
import Swal from 'sweetalert2';

const defaultData = {
    page: 1,
    last_page: 0,
    total: 0,
    data: []
};

const TabTracking = () => {

    // app
    const app_context = useContext(AppContext);

    // project
    let { project } = useContext(ProjectContext);
    let isProject = Object.keys(project).length;

    // estados
    const [option, setOption] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [code, setCode] = useState("");
    const [tracking, setTracking] = useState(defaultData)

    // obtener tracking
    const getTracking = async (nextPage = 1, up = false) => {
        await projectTracking.get(`project/${project.id}/tracking?page=${nextPage}`)
            .then(res => {
                let { success, message, trackings } = res.data;
                if (!success) throw new Error(message);
                setTracking({
                    page: trackings.page,
                    last_page: trackings.last_page,
                    total: trackings.total,
                    data: up ? [...tracking.data, trackings.data] : trackings.data
                });
            })
            .catch(err => console.log(err.message));
    }

    // agregar tracking
    const addTracking = async () => {
        let answer = await Confirm("warning", `¿Deseas guardar el código?`, 'Guardar');
        if (answer) {
            app_context.setCurrentLoading(true);
            let datos = {};
            datos.project_id = project.id;
            datos.code = code;
            await projectTracking.post(`tracking`, datos)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setCode("");
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { message, errors } = err.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message })
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message || err.message })
                    }
                });
        }
    }

    // cargar datos
    useEffect(() => {
        if (project.id) getTracking();
    }, []);

    // render
    return (
    <Fragment>
        <div className="row">
            <div className="col-md-6 mb-3">
                <Form>
                    <Form.Field>
                        <input type="text" className="uppercase" 
                            placeholder="Ingrese el código el trámite"
                            value={code || ""}
                            onChange={({target}) => target.value && target.value.length <= 10 || target.value == '' ? setCode(target.value) : null}
                        />
                        <div className="text-right">
                            <small>{code.length}/10</small>
                        </div>
                    </Form.Field>
                </Form>
            </div>

            <div className="col-md-6 mb-3">
                <Button 
                    color="green" 
                    basic
                    onClick={addTracking}
                    disabled={code.length < 10 || current_loading}
                >
                    <i className="fas fa-plus"></i>
                </Button>
            </div>

            <div className="col-md-12">
                <hr/>
            </div>
            
            <div className="col-md-12 mt-4">
                <div className="row">
                    {tracking && tracking.data && tracking.data.map((tra, indexT) => 
                        <div className="col-md-6 mb-2" key={`tracking-project-${indexT}`}>
                            <div className="card">
                                <div className="card-header">
                                    {tra && tra.tramite && tra.tramite.slug}
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-9">
                                            <div className="mb-3">
                                                <b>Asunto: </b> {tra.tramite && tra.tramite.asunto}
                                            </div>

                                            <div className="mb-3">
                                                <b>Remitente: </b>  <span className="uppercase">{tra.tramite && tra.tramite.person && tra.tramite.person.fullname || ""}</span>
                                            </div>

                                            <div className="mb-3">
                                                <b>Tip. Documento: </b> <span className="uppercase">{tra.tramite && tra.tramite.tramite_type && tra.tramite.tramite_type.description || ""}</span>
                                            </div>

                                            <div>
                                                <b>N° Documento: </b> {tra.tramite && tra.tramite.document_number || ""}
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div style={{ width: "120px", height: "120px", background: 'red' }}>
                                                <img src={tra.tramite && tra.tramite.code_qr || ""} alt="code_qr"
                                                    style={{ width: "100%", height: "100%" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>    
                    )}
                </div>
            </div>
        </div>
    </Fragment>)
}

export default TabTracking;