import React, { useContext, useState } from 'react';
import Show from '../../show';
import { Button } from 'semantic-ui-react'
import ConfigRemuneracion from './config-infos/config-remuneracion';
import ConfigDiscount from './config-infos/config-discount';
import ConfigAportation from './config-infos/config-aportation';
import { microPlanilla } from '../../../services/apis';
import { Confirm } from '../../../services/utils';
import { AppContext } from "../../../contexts/AppContext";
import Swal from 'sweetalert2';

const ItemInfo = ({ info = {}, onEdit = null, onAdd = null }) => {

  const [option, setOption] = useState();

  const { setCurrentLoading } = useContext(AppContext);

  const handleSyncConfig = async () => {
    const  answer = await Confirm("warning", "¿Estás seguro en sincronizar la configuración de pagos?");
    if (!answer) return;
    setCurrentLoading(true);
    await microPlanilla.post(`infos/${info?.id}/process/syncConfigPays`)
    .then(() => {
      setCurrentLoading(false);
      Swal.fire({ icon: "success", text: "La configuración se sincronizó correctamente!" })
    }).catch(() => {
      setCurrentLoading(false);
      Swal.fire({ icon: "error", text: "Ocurrio un error, vuelva a intentarlo más tarde!" })
    });
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="badge badge-dark">
              {info?.planilla?.name} 
          </span> 
          <i className="ml-2 mr-2 fas fa-arrow-right"></i>
          Meta: {info?.pim?.code}
          <Show condicion={onEdit}>
            <span className='close cursor-pointer text-primary'
              onClick={onEdit}
            >
              <i className="fas fa-pencil-alt fas-sm"></i>
            </span>
          </Show>
        </div>
        <div className="card-body">
          <div className="mb-2"><b>ID: </b>{info?.id}</div>
          <div className="mb-2"><b>Medio de Pago: </b>{info.isCheck ? 'Cheque' : 'Cuenta'}</div>
          <div className="mb-2"><b>Banco: </b>{info?.bank?.name}</div>
          <div className="mb-2"><b>N° Cuenta: </b>{info?.numberOfAccount}</div>
          <div className="mb-2">
            <b>Sincronizar al Contrato: </b>
            <span className={`badge badge-${info?.isSync ? 'primary' : 'danger'}`}>
              {info?.isSync ? 'Si' : 'No'}
            </span>
          </div>
          <div className="mb-2">
            <b>Pagar: </b>
            <span className={`badge badge-${info?.isPay ? 'primary' : 'danger'}`}>
              {info?.isPay ? 'Si' : 'No'}
            </span>
          </div>
          <div className="mb-2">
            <b>Estado: </b>
            <span className={`badge ml-1 mr-1 badge-${info?.state ? 'success' : 'danger'}`}>
                {info?.state ? 'Activo' : 'Terminado'}
            </span>
          </div>
        </div>
        <div className="card-footer">
          <div className="card-body text-left">
            <Button.Group size="mini">
              <Button onClick={() => setOption('REMUNERACION')}
                title="Configurar Remuneración"
              >
                <i className="fas fa-coins"></i>
              </Button>

              <Button onClick={() => setOption('DESCUENTO')}
                title="Configurar Descuentos"
              >
                <i className="fas fa-tags"></i>
              </Button>

              <Button onClick={() => setOption('APORTACION')}
                title="Configurar Aportaciones del Empleador"
              >
                <i className="fas fa-chess-pawn"></i>
              </Button>
              <Button onClick={handleSyncConfig}
                title="Sincronizar todas las configuraciones"
              >
                <i className="fas fa-sync"></i>
              </Button>
            </Button.Group>
          </div>
        </div>
      </div>
      {/* configurar remuneración*/}
      <Show condicion={option == 'REMUNERACION'}>
        <ConfigRemuneracion
          info={info}
          onClose={() => setOption()}
        />
      </Show>
      {/* configurar descuentos*/}
      <Show condicion={option == 'DESCUENTO'}>
        <ConfigDiscount
          info={info}
          onClose={() => setOption()}
        />
      </Show>
      {/* configurar aportaciones*/}
      <Show condicion={option == 'APORTACION'}>
        <ConfigAportation
          info={info}
          onClose={() => setOption()}
        />
      </Show>
    </>
  )
}

export default ItemInfo;