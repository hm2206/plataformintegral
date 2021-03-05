import React, { useContext, useEffect, useState } from 'react';
import { signature } from '../../services/apis';
import ModalRightPerson from '../authentication/modalRightPerson';
import { Confirm } from '../../services/utils';
import { GroupContext } from '../../contexts/SignatureContext';

const actions = {
    ADD: 'add'
}

const AddTeam = ({ show, onClose, checked = [] }) => {

    // group
    const group_context = useContext(GroupContext);

    // estados
    const [current_user, setCurrentUser] = useState({});
    const [option, setOption] = useState("");

    // agregemos al equipo
    const create = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en agregar al equipo?`, 'Estoy seguro');
        if (!answer) return false;
        let payload = {
            user_id: current_user
        };
        // enviar datos
        await signature.post(`post`, `auth/team`, )
    }

    // render
    return (
        <ModalRightPerson
            show={show}
            title="Equipo"
            onClose={onClose}
            onCheck={(e, user) => {
                setCurrentUser(user);
                setOption(actions.ADD);
            }}
        />
    );
}

export default AddTeam;