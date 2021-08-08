import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import moment from 'moment'
import EditLicense from './editLicense';
import ListFile from '../file/listFile';
import Show from '../../show';

const ItemLicense = ({ license, onUpdate = null, onDelete = null }) => {

    const [option, setOption] = useState("");

    return (
        <div className="card">
            <div className="card-header">
                Documento que autoriza: {license?.resolution}
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-12">
                        <div className="mb-2"><b>Tipo. Licencia: </b> {license?.situacion_laboral?.nombre}</div>
                        <div className="mb-2"><b>Fecha Documento que autoriza: </b> {moment(license?.date_start).format('DD/MM/YYYY')}</div>
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
                        <Button color="black" basic onClick={() => setOption("FILE")}>
                            <i className="far fa-file-alt"></i>
                        </Button>
                        
                        <Button onClick={() => setOption("EDIT")}>
                            <i className="fas fa-pencil-alt"></i>
                        </Button>
                    </Button.Group>
                </div>
            </div>
            {/* editar permission */}
            <Show condicion={option == 'EDIT'}>
                <EditLicense
                    onClose={() => setOption("")}
                    license={license}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            </Show>
            {/* mostrar archivos */}
            <Show condicion={option == 'FILE'}>
                <ListFile
                    onClose={() => setOption(false)}
                    objectId={license?.id}
                    objectType="App/Models/License"
                    multiple={true}
                />
            </Show>
        </div>
    )
}

export default ItemLicense;