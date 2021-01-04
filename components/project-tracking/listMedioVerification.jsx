import React, { useContext, useState } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import Modal from '../modal'
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import Swal from 'sweetalert2';
import AddMedioVerification from './addMedioVerification';

const ListMedioVerification = ({ meta, isClose }) => {

    // render
    return <AddMedioVerification isClose={isClose} meta={meta} editable={false}/>
}

export default ListMedioVerification;