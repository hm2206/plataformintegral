import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import moment from 'moment'
import EditPermission from './editPermission';
import Show from '../../show';
import ListFile from '../file/listFile';

const ItemPermission = ({ permission, onUpdate = null, onDelete = null }) => {

    const [option, setOption] = useState("");

    return (
        <div className="card">
            <div className="card-header">
                N° {permission?.option}: <small className={`badge badge-sm badge-dark`}>{permission?.document_number}</small>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-12">
                        <div className="mb-2"><b>Tipo de Permiso: </b> {permission?.type_permission?.description}</div>
                        <div className="mb-2"><b>Fecha Inicio: </b> {moment(permission?.date_start).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Fecha Fin: </b> {moment(permission?.date_over).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Dias Usados: </b> {permission?.days_used}</div>
                        <div className="mb-2"><b>Justificación: </b> {permission?.justification}</div>
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
                <EditPermission
                    onClose={() => setOption("")}
                    permission={permission}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            </Show>
            {/* mostrar archivos */}
            <Show condicion={option == 'FILE'}>
                <ListFile
                    onClose={() => setOption(false)}
                    objectId={permission?.id}
                    objectType="App/Models/Permission"
                    multiple={true}
                />
            </Show>
        </div>
    )
}

export default ItemPermission;