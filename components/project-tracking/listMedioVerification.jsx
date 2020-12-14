import React, { useContext, useState } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import Modal from '../modal'
import { SelectRol } from '../select/project_tracking'
import Show from '../show';
import storage from '../../services/storage.json';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import Swal from 'sweetalert2';

const ListMedioVerification = ({ medio_verification = [], isClose }) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-list-alt"></i> Medios de Verificación</span>}
            isClose={isClose}
        >  
            <Form className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medio_verification.map(m =>
                                <tr>
                                   <td>{m}</td> 
                                </tr>    
                            )}
                        </tbody>
                    </table>
                </div>
            </Form>
        </Modal>
    )
}

export default ListMedioVerification;