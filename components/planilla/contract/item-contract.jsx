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
                <span className="badge badge-primary">
                    {info?.typeCategory?.name}
                </span> 
            </div>
            <div className="card-body">
                <div className="mb-2"><b>ID: </b>{info?.id}</div>
                <div className="mb-2"><b>Condición: </b>{info?.condition}</div>
                <div className="mb-2"><b>Resolución: </b>{info?.resolution}</div>
                <div className="mb-2"><b>Fecha de Resolución: </b>{displayDateResolution}</div>
                <div className="mb-2"><b>Fecha de Incio: </b>{displayDateStart}</div>
                <div className="mb-2"><b>Fecha de cese: </b>{displayDateOver}</div>
                <div className="mb-2"><b>Dependencia: </b>{info?.dependency?.name}</div>
                <div className="mb-2"><b>Cargo: </b>{info?.profile?.name}</div>
                <div className="mb-2"><b>Plaza: </b>{info?.plaza}</div>
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