import React, { Fragment, useEffect, useState, useContext } from 'react';
import { Button } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import { BtnBack } from '../../../components/Utils';
import { handleErrorRequest, unujobs } from '../../../services/apis';
import { Confirm } from '../../../services/utils';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import atob from 'atob'
import ContentControl from '../../../components/contentControl';
import UpdateRemuneracion from '../../../components/contrato/updateRemuneracion';
import UpdateAportacion from '../../../components/contrato/updateAportacion';
import UpdateDescuento from '../../../components/contrato/updateDescuento';
import { AppContext } from '../../../contexts/AppContext';
import BoardSimple from '../../../components/boardSimple';
import CardInfo from '../../../components/contrato/cardInfo';
import NotFoundData from '../../../components/notFoundData';
import { EntityContext } from '../../../contexts/EntityContext';


// componente principal
const Pay = ({ pathname, query, success, info }) => {

    // validar datos
    if (!success) return <NotFoundData/>

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [edit, setEdit] = useState(false);
    const [send, setSend] = useState(false);

    // cancelar edición
    const cancelConfig = async () => {
        setEdit(false);
    }

    // sincronizar remuneraciones
    const syncConfig = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en sincronizar las configuraciones?`, 'Estoy seguro');
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await unujobs.post(`info/${info.id}/sync_config`)
        .then(res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            history.go(location.href);
        }).catch(err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
    }
    
    // manejador de acciones
    const handleOption = async (e, index, obj) => {
        switch (obj.key) {
            case 'sync':
                await syncConfig();
                break;
            default:
                break;
        }
    }

    // cargar entity
    useEffect(() => {
        entity_context.fireEntity({ render: true, disabled: true, entity_id: info.entity_id });
        return () => entity_context.fireEntity({ render: false, disabled: false });
    }, []);

    // renderizar
    return (
    <Fragment>
        <div className="col-md-12">
            <BoardSimple
                bg="light"
                prefix={<BtnBack/>}
                title="Contrato"
                info={['Configuración de contrato']}
                onOption={handleOption}
                options={[
                    { key: 'sync', title: 'Sincronizar contrato', icon: 'fas fa-sync' }
                ]}
            >
                <div className="card-">
                    <div className="card-body">
                        <CardInfo info={info}/>
                    </div>

                    <Show condicion={success}>
                        <div className="card-body" id="config">
                            <UpdateRemuneracion 
                                info={info} 
                                edit={edit}
                                onUpdate={(e) => setEdit(false)}
                            />
                            <div className="mt-5 mb-5"></div>
                            <UpdateAportacion 
                                info={info} 
                                edit={edit}
                            />
                            <div className="mt-5 mb-5"></div>
                            <UpdateDescuento 
                                info={info} 
                                edit={edit} 
                                onUpdate={(e) => setEdit(false)}
                            />
                        </div>
                    </Show>
                </div>
            </BoardSimple>
        </div>

        <Show condicion={success && info.estado}>
            <ContentControl>
                <Show condicion={edit}>
                    <div className="col-lg-2 col-6">
                        <Button fluid color="red"
                            onClick={cancelConfig}>
                            <i className="fas fa-times"></i> Cancelar
                        </Button>
                    </div>
                </Show>

                <Show condicion={!edit}>
                    <div className="col-lg-2 col-6">
                        <Button fluid 
                            color="orange" 
                            onClick={(e) => setEdit(true)}>
                            <i className="fas fa-pencil-alt"></i> Editar
                        </Button>
                    </div>
                </Show>
            </ContentControl>
        </Show>
    </Fragment>)
}

// server rendering
Pay.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let id = atob(query.id || "") || "__error";
    // request
    let { success, info } = await unujobs.get(`info/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false }));
    // response
    return { pathname, query, success, info };
}

export default Pay;