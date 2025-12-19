import React , { useState, useContext, useEffect } from 'react';
import BoardSimple from '../../../components/boardSimple';
import { BtnBack, BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { signature, handleErrorRequest } from '../../../services/apis';
import { GroupProvider } from '../../../contexts/signature/GroupContext';
import AddTeam from '../../../components/signature/group/addTeam';
import ListTeam from '../../../components/signature/group/listTeam';
import ListFileGroup from '../../../components/signature/group/listFileGroup';
import UploadFileGroup from '../../../components/signature/group/uploadFileGroup';
import NotFoundData from '../../../components/notFoundData'
import Show from '../../../components/show';
import { EntityContext } from '../../../contexts/EntityContext';
import { Confirm, backUrl } from '../../../services/utils';
import { AppContext } from '../../../contexts';
import Swal from 'sweetalert2';
import Router, { useRouter } from 'next/router';
import { Message, Button } from 'semantic-ui-react';

const refreshOption = { key: 'REFRESH', title: 'Refrescar Grupo', icon: 'fas fa-sync' };

const options = [
    { key: 'ADD_TEAM', title: 'Agregar al equipo de firma', icon: 'fas fa-user-plus' },
    refreshOption,
]


const SlugGroup = () => {
    const router = useRouter();
    const { pathname, query } = router;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [group, setGroup] = useState({});

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await signature.get(`auth/group/${query.slug || `)
            .then(res => {
                setSuccess(res.data.success);
                setGroup(res.data.group);
            })
            .catch(err => console.error(err));
        setLoading(false);
    };


    // validar datos
    if (!success) return <NotFoundData/>

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [option, setOption] = useState("");

    let configHeaders = {
        headers: {
            EntityId: group.entity_id,
            DependenciaId: group.dependencia_id,
            GroupId: group.id
        }
    }

    // manejar opciones
    const handleOption = async (e, index, obj) => {
        switch (obj.key) {
            case 'ADD_TEAM':
            case 'ADD_VALIDATION':
                setOption(obj.key);
                break;
            case 'REFRESH':
                await Router.push(location.href);
            default:
                break;
        }
    }

    // manejar verificación
    const handleVerify = async () => {
        let answer = await Confirm('warning', `¿Estás seguro en verificar?`, 'Verificar');
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        // config
        let options = {
            headers: {
                EntityId: group.entity_id,
                DependenciaId: group.dependencia_id,
                GroupId: group.id
            }
        }
        // request
        await signature.post(`auth/group/${group.id}/verify?_method=PUT`, {}, options)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            Router.push(location.href);
        }).catch(err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
    }

    // manejar verificación
    const handleSigner = async () => {
        let answer = await Confirm('warning', `¿Estás seguro en ejecutar el firmado masivo?`, 'Firmar');
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        // request
        await signature.post(`auth/signer_massive/${group.id}`, {}, configHeaders)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            Router.push(location.href);
        }).catch(err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
    }

    // eliminar grupo
    const handleDelete = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en eliminar?`, 'Eliminar');
        if (!answer) return;
        app_context.setCurrentLoading(true);
        await signature.post(`auth/group/${group?.id}?_method=DELETE`, {}, configHeaders)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            let newQuery = { dependencia_id: query.dependencia_id };
            Router.push({ pathname: backUrl(pathname), query: newQuery })
        }).catch(err => handleErrorRequest(err, null, app_context.setCurrentLoading(false)))
    }

    // activar entity
    useEffect(() => {
        entity_context.fireEntity({ render: true, disabled: true, entity_id: group.entity_id || "" });
        return () => entity_context.fireEntity({ render: false, disabled: false })
    }, []);

    // render
    return (
        <div className="col-md-12">
            <GroupProvider group={group}>
                <BoardSimple
                    bg="light"
                    title={group.title || ""}
                    info={[group.description || '']}
                    prefix={<BtnBack className="mr-2"/>}
                    onOption={handleOption}
                    options={group.status == 'START' ? options : [refreshOption]}
                >
                    <div className="row">
                        <div className="col-md-8">
                            <div className="card-body">
                                <div className="row">
                                    <Show condicion={group.status == 'OVER'}>
                                        <div className="col-md-12 mb-3">
                                            <div>
                                                <Message
                                                    info
                                                    header='Firmados'
                                                    content="Todos los PDF's están firmados"
                                                />
                                            </div>
                                            <hr/>
                                        </div>
                                    </Show>

                                    <Show condicion={group.status == 'SIGNED'}>
                                        <div className="col-md-12 mb-3">
                                            <div>
                                                <Message
                                                    warning
                                                    header='Procesando...'
                                                    content="Todos los PDF's están siendo firmados"
                                                />
                                            </div>
                                            <hr/>
                                        </div>
                                    </Show>

                                    <Show condicion={group.status == 'START'}>
                                        <div className="col-md-12 mt-4">
                                            <UploadFileGroup/>
                                            <hr/>
                                        </div>
                                    </Show>

                                    <dic className="col-md-12 mb-1">
                                        <Button color="red" onClick={handleDelete}>
                                            <i className="fas fa-trash"></i> Eliminar Grupo de Firma
                                        </Button>
                                        <hr />
                                    </dic>

                                    <div className="col-md-12">
                                        {/* listar archivos */}
                                        <ListFileGroup/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            {/* listar team */}
                            <ListTeam/>
                        </div>
                    </div>
                </BoardSimple>
                {/* agregar equipo */}
                <AddTeam 
                    show={option == 'ADD_TEAM'}
                    onClose={(e) => setOption('')}
                />
                {/* btn de verificacion */}
                <Show condicion={group.status == 'START'}>
                    <BtnFloat theme="bg-warning"
                        title="Verificar Grupo"
                        onClick={handleVerify}
                    >
                        <i className="fas fa-check"></i>
                    </BtnFloat>
                </Show>
                {/* firmar archivos */}
                <Show condicion={group.status == 'VERIFIED'}>
                    <BtnFloat
                        title="Ejecutar firma masiva"
                        onClick={handleSigner}
                    >
                        <i className="fas fa-signature"></i>
                    </BtnFloat>
                </Show>
            </GroupProvider>
        </div>
    )
}

// exportar
export default SlugGroup;