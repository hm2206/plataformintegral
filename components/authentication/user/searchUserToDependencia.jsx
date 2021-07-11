import React from 'react'
import { authentication } from '../../../services/apis';
import ModalRequest from '../../modalRequest';

const SearchUserToDependencia = ({ dependencia_id = "_error", entity_id = "__error", hidden = [], disabled = [], getAdd = null, onClose = null }) => {

    return (
        <ModalRequest api={authentication}
            title="Usuarios por dependencia"
            path={`dependencia/${dependencia_id || '__error'}/user_entity/${entity_id || '__error'}?state=1`}
            result="user"
            data={{ image: "image_images.image_50x50", text: "fullname" }}
            hidden={hidden}
            disabled={disabled}
            getAdd={getAdd}
            isClose={onClose}
        >
            
        </ModalRequest>
    );
}

export default SearchUserToDependencia;