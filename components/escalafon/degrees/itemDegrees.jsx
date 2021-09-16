import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import moment from 'moment'
import EditDegrees from './editDegrees';
import Show from '../../show';
import ListFile from '../file/listFile';

const ItemDegrees = ({ degree, onUpdate = null, onDelete = null }) => {

    const [option, setOption] = useState("");

    return (
        <div className="card">
            <div className="card-header">
                N° Documento: {degree?.document_number}
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-12">
                        <div className="mb-2"><b>Tipo. Grado: </b> {degree?.type_degree?.name}</div>
                        <div className="mb-2"><b>Institución: </b> {degree?.institution}</div>
                        <div className="mb-2"><b>Lugar: </b> {degree?.place}</div>
                        <div className="mb-2"><b>N° Documento: </b> {degree?.document_number}</div>
                        <div className="mb-2"><b>Fecha: </b> {moment(degree?.date).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Descripción: </b> {degree?.description}</div>
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
                <EditDegrees
                    onClose={() => setOption("")}
                    degree={degree}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            </Show>
            {/* mostrar archivos */}
            <Show condicion={option == 'FILE'}>
                <ListFile
                    onClose={() => setOption(false)}
                    objectId={degree?.id}
                    objectType="App/Models/Degree"
                    multiple={true}
                />
            </Show>
        </div>
    )
}

export default ItemDegrees;