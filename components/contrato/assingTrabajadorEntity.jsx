import React, { useContext } from 'react'
import { EntityContext } from '../../contexts/EntityContext';
import { escalafon } from '../../services/apis';
import ModalRequest from '../modalRequest';

const AssignTrabajadorEntity = ({ isClose = null, getAdd = null, show = true }) => {

    const { entity_id } = useContext(EntityContext);

    return <ModalRequest
        api={escalafon}
        path={`entities/${entity_id}/works`}
        result="works"
        isClose={isClose}
        getAdd={getAdd}
        show={show}
        data={{ 
            image: "person.image.image_images.image_images.image_50x50",
            text: "person.fullname"
        }}
    />
}

// exportar
export default AssignTrabajadorEntity;