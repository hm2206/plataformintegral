import React, { useMemo } from 'react';
import Show from '../../show';
import { Button } from 'semantic-ui-react'
import moment from 'moment';

const ItemInfo = ({ info = {}, onEdit = null, onAdd = null }) => {

    const displayDateResolution = useMemo(() => {
        return info?.dateOfResolution 
            ? moment(info?.dateOfResolution).format('DD/MM/YYYY')
            : '';
    }, [info]);

    const displayDateStart = useMemo(() => {
        return info?.dateOfAdmission 
            ? moment(info?.dateOfAdmission).format('DD/MM/YYYY')
            : '';
    }, [info]);

    const displayDateOver = useMemo(() => {
        return info?.terminationDate 
            ? moment(info?.terminationDate).format('DD/MM/YYYY')
            : '';
    }, [info]);

  return (
    <div className="card">
      <div className="card-header">
        <span className="badge badge-dark">
            {info?.planilla?.name} 
        </span> 

        <i className="ml-2 mr-2 fas fa-arrow-right"></i>

        Meta: {info?.pim?.code}
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
        <div className="card-body text-right">
          <Button.Group size="mini">
            <Show condicion={onAdd}>
              <Button onClick={onAdd}
                title="Crear un nuevo contrato apartir del contrato selecionado" 
              >
                <i className="fas fa-plus"></i>
              </Button>
            </Show>

            <Show condicion={onEdit}>
              <Button onClick={onEdit}
                title="Editar Contrato"
              >
                <i className="fas fa-pencil-alt"></i>
              </Button>
            </Show>
          </Button.Group>
        </div>
      </div>
    </div>
  )
}

export default ItemInfo;