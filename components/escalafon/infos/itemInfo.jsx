import React, { useMemo } from 'react';
import Show from '../../show';

const ItemInfo = ({ info = {}, onEdit = null }) => {

    const isEdit = useMemo(() => {
        return typeof onEdit == 'function';
    }, [onEdit]);

    return (
        <div className="card">
            <div className="card-header">
                {info?.planilla?.nombre} 
                <i className="fas fa-arrow-right ml-1 mr-1"></i>
                
                <span className="badge badge-primary">
                    {info?.type_categoria?.descripcion}
                </span> 
                
                <Show condicion={isEdit}>
                    <span className="close cursor-pointer" onClick={onEdit}>
                        <i className="fas fa-pencil-alt fa-sm"></i>
                    </span>
                </Show>
            </div>
            <div className="card-body">
                <div className="mb-2"><b>Resolución: </b>{info?.resolucion}</div>
                <div className="mb-2"><b>Fecha de Resolución: </b>{info?.fecha_de_resolucion}</div>
                <div className="mb-2"><b>Fecha de Incio: </b>{info?.fecha_de_inicio}</div>
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
        </div>
    )
}

export default ItemInfo;