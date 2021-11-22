import React, { useMemo } from 'react';
import Show from '../../show';
import { Button } from 'semantic-ui-react'

const ItemInfo = ({ info = {}, onEdit = null, onAdd = null }) => {

    const isEdit = useMemo(() => {
        return typeof onEdit == 'function';
    }, [onEdit]);

    const isAdd = useMemo(() => {
        return typeof onAdd == 'function';
    }, [onAdd])

    return (
        <div className="card">
            <div className="card-header">
                {info?.planilla?.nombre} 
                <i className="fas fa-arrow-right ml-1 mr-1"></i>
                
                <span className="badge badge-primary">
                    {info?.type_categoria?.descripcion}
                </span> 
            </div>
            <div className="card-body">
                <div className="mb-2"><b>ID: </b>{info?.id}</div>
                <div className="mb-2"><b>Resolución: </b>{info?.resolucion}</div>
                <div className="mb-2"><b>Fecha de Resolución: </b>{info?.fecha_de_resolucion}</div>
                <div className="mb-2"><b>Fecha de Incio: </b>{info?.fecha_de_ingreso}</div>
                <div className="mb-2"><b>Fecha de cese: </b>{info?.fecha_de_cese}</div>
                <div className="mb-2"><b>Plaza: </b>{info?.plaza}</div>
                <div className="mb-2"><b>P.A.P: </b>{info?.pap}</div>
                <div className="mb-2">
                    <b>Estado: </b>
                    <span className={`badge ml-1 mr-1 badge-${info?.estado ? 'success' : 'danger'}`}>
                        {info?.estado ? 'Activo' : 'Terminado'}
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