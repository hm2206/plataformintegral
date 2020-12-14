import React, { useContext, useState } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import Modal from '../modal'
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { projectTracking } from '../../services/apis';
import TableSaldoFinanciero from './tableSaldoFinanciero';
import Swal from 'sweetalert2';

const AnualPlanTrabajo = ({ plan_trabajo, isClose = null }) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);

    // estados
    const [form, setForm] = useState({});
    const [refresh, setRefresh] = useState(false);

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-file-alt"></i> Plan de Trabajo Anual</span>}
            md="9"
            isClose={isClose}
        >  
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Titulo: </th>
                                <td>{project.title}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th colSpan="2" className="text-center">Información General</th>
                            </tr>
                            <tr>
                                <td colSpan="2">
                                    <table className="table table-bordered">
                                        <tr>
                                            <th width="25%">Resolución de aprobación del proyecto: </th>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <th>Objectivo general: </th>
                                            <td>{project.general_object}</td>
                                        </tr>
                                        <tr>
                                            <th>Objectivo específico: </th>
                                            <td>
                                                <ol type="1">
                                                    <li>Hola</li>
                                                </ol>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Costo del proyecto: </th>
                                            <td>{project.duration} meses</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th colSpan="2" className="text-center">Actividades a ejecutar</th>
                            </tr>
                            <tr>
                                <th colSpan="2" className="text-center">Métodos para ejecutar las actividades</th>
                            </tr>
                            <tr>
                                <th colSpan="2" className="text-center">Cronograma mensual de actividades</th>
                            </tr>
                            <tr>
                                <th colSpan="2" className="text-center">Presupuesto</th>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    )
}

export default AnualPlanTrabajo;