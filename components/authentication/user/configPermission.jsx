import React, { useEffect, useRef, useState } from 'react';
import Modal from '../../modal';
import { Form, Button, Loader } from 'semantic-ui-react';
import ConfigPermissionList from './configPermissionList';
import UserProvider from '../../../providers/authentication/UserProvider';
import Show from '../../show';


const ConfigPermission = ({ user, isClose }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [data, setData] = useState([]);
    const [is_error, setIsError] = useState(false);

    // provider
    const userProvider = new UserProvider();

    // obtener permisos
    const getPermissions = async () => {
        setCurrentLoading(true);
        await userProvider.permissions(user.id)
        .then(res => {
            setData(res);
            setIsError(false);
        })
        .catch(err => setIsError(true));
        setCurrentLoading(false);
    }   

    // executar
    useEffect(() => {
        getPermissions();
    }, []);

    // render
    return (
        <Modal show={true}
            isClose={isClose}
            titulo={<span><i className="fas fa-user-tag"></i> Configurar Permisos</span>}
        >
            <div className="card-body">
                {/* preloader */}
                <Show condicion={current_loading}>
                    <div className="text-center mt-2">
                        <Loader active inline='centered'/>
                    </div>
                </Show>
                {/* listar permisos */}
                <ConfigPermissionList data={data} 
                    user={user}
                    disabled={current_loading}
                />
            </div>
        </Modal>    
    );
}

export default ConfigPermission;