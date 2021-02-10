import React, { Fragment, useEffect, useState, useContext } from 'react';
import { Button } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/router';
import { BtnBack } from '../../../components/Utils';
import { unujobs } from '../../../services/apis';
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


// componente principal
const Pay = ({ success, info, query }) => {

    // app
    const app_context = useContext(AppContext);

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
        app_context.fireLoading(true);
        await unujobs.post(`info/${info.id}/sync_config`)
        .then(res => {
            app_context.fireLoading(false);
            let { success, message } = res.data;
            Swal.fire({ icon: 'success', text: message });
        }).catch(err => {
            try {
                app_context.fireLoading(false);
            } catch (error) {
                Swal.fire({ icon: 'error', text: error.message });
            }
        });
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

    return (
    <Fragment>
        <div className="col-md-12">
            <BoardSimple
                bg="light"
                prefix={<BtnBack/>}
                title="Configuración de contrato"
                info={['Configurar remuneraciones, descuentos y aportaciones']}
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
    let id = atob(ctx.query.id || "");
    // request
    let { success, info } = await unujobs.get(`info/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false }));
    // response
    return { success, info: info || {}, query: ctx.query };
}

export default Pay;