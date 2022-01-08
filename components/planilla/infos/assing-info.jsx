import React from 'react'
import ModalRequest from '../../modalRequest';
import { escalafon } from '../../../services/apis'

const AssignInfo = ({ onClose = null, onAdd = null, show = true }) => {

    return <ModalRequest
        title="Asignar Contrato"
        api={escalafon}
        path="infos?estado=1&principal=1"
        result="infos"
        isClose={onClose}
        getAdd={onAdd}
        show={show}
        data={{ 
            image: "work.person.image.image_images.image_images.image_50x50",
            text: "work.person.fullname",
            badge: "type_categoria.descripcion"
        }}
    />
}

export default AssignInfo;