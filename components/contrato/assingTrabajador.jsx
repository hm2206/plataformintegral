import React from 'react'
import { unujobs } from '../../services/apis';
import ModalRequest from '../modalRequest';

const AssignTrabajador = ({ isClose = null, getAdd = null }) => {

    return <ModalRequest
        api={unujobs}
        path="work"
        result="works"
        isClose={isClose}
        getAdd={getAdd}
        data={{ 
            image: "person.image.image_images.image_images.image_50x50",
            text: "person.fullname"
        }}
    />
}

// exportar
export default AssignTrabajador;