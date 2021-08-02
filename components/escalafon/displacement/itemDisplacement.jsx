import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import moment from 'moment'
import EditLicense from './editDisplacement';
import ListFile from '../file/listFile';
import Show from '../../show';

const ItemAscent = ({ displacement, onUpdate = null, onDelete = null }) => {

    const [option, setOption] = useState("");

    return (
        <div className="card">
            <div className="card-header">
                Resolución: {displacement?.resolution}
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-12">
                        <div className="mb-2"><b>Fecha Resolución: </b> {moment(displacement?.date_start).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Fecha Inicio: </b> {moment(displacement?.date_start).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Fecha Termino: </b> {moment(displacement?.date_over).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Dependencia: </b> {displacement?.dependencia?.nombre}</div>
                        <div className="mb-2"><b>Perfil Laboral: </b> <span className="badge badge-dark">{displacement?.perfil_laboral?.nombre}</span></div>
                        <div className="mb-2"><b>Descripción: </b> {displacement?.description}</div>
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
                    displacement={displacement}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            </Show>
            {/* mostrar archivos */}
            <Show condicion={option == 'FILE'}>
                <ListFile
                    onClose={() => setOption(false)}
                    objectId={displacement?.id}
                    objectType="App/Models/Displacement"
                    multiple={true}
                />
            </Show>
        </div>
    )
}

export default ItemAscent;