import React, { useContext, useState } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import Modal from '../modal'
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import TableSaldoFinanciero from './tableSaldoFinanciero';
import Swal from 'sweetalert2';

const ExecutePlanTrabajo = ({ plan_trabajo, isClose = null }) => {

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
            titulo={<span><i className="fas fa-info-circle"></i> Ejecutar Plan de Trabajo</span>}
            md="12"
            isClose={isClose}
        >  
            <div className="card-body">
                <div className="row">
                    <div className="col-md-12">
                        <TableSaldoFinanciero plan_trabajo={plan_trabajo} 
                            refresh={refresh} 
                            execute={true}
                            viewer={['financiera']}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ExecutePlanTrabajo;