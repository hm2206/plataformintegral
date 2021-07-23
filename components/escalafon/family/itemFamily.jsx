import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import moment from 'moment'
import EditFamily from './editFamily';
import Show from '../../show';

const ItemFamily = ({ license, onUpdate = null, onDelete = null }) => {

    const [option, setOption] = useState("");

    return (
        <div className="card">
            <div className="card-header">
                Resolución: {license?.resolution}
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-12">
                        <div className="mb-2"><b>Tipo. Licencia: </b> {license?.situacion_laboral?.nombre}</div>
                        <div className="mb-2"><b>Fecha Resolución: </b> {moment(license?.date_start).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Fecha Inicio: </b> {moment(license?.date_start).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Fecha Termino: </b> {moment(license?.date_over).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Dias Usados: </b> {license?.days_used}</div>
                        <div className="mb-2"><b>Tipo: </b> <span className="badge badge-primary">{license?.is_pay ? 'Con Gose' : 'Sin Gose'}</span></div>
                        <div className="mb-2"><b>Descripción: </b> {license?.description}</div>
                    </div>
                </div>
            </div>
            <div className="card-footer">
                <div className="card-body text-right">
                    <Button.Group size="mini">
                        <Button onClick={() => setOption("EDIT")}>
                            <i className="fas fa-pencil-alt"></i>
                        </Button>
                    </Button.Group>
                </div>
            </div>
            {/* editar permission */}
            <Show condicion={option == 'EDIT'}>
                <EditFamily
                    onClose={() => setOption("")}
                    license={license}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            </Show>
        </div>
    )
}

export default ItemFamily;