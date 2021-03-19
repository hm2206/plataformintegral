import React, { Fragment, useContext, useState } from 'react';
import { signature } from '../../services/apis';
import ModalRightPerson from '../authentication/modalRightPerson';
import { Confirm } from '../../services/utils';
import { GroupContext } from '../../contexts/SignatureContext';

const actions = {
    ADD: 'add',
    CREATE: 'create',
}

const AddTeam = ({ show, onClose, checked = [] }) => {

    // group
    const group_context = useContext(GroupContext);

    // estados
    const [current_person, setCurrentPerson] = useState({});
    const [option, setOption] = useState("");
    const [percent, setPercent] = useState(0);

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
        <Fragment>
            <ModalRightPerson
                show={show}
                title="Agregar Equipo"
                onClose={onClose}
                onCheck={(e, person) => {
                    setCurrentPerson(person);
                    setOption(actions.CREATE);
                }}
            >
                <hr/>
            </ModalRightPerson>
        </Fragment>
    );
}

export default AddTeam;