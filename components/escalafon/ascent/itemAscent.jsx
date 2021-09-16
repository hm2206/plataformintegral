import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import moment from 'moment'
import EditAscent from './editAscent';
import ListFile from '../file/listFile';
import Show from '../../show';

const ItemAscent = ({ ascent, info, onUpdate = null, onDelete = null }) => {

    const [option, setOption] = useState("");

    return (
        <div className="card">
            <div className="card-header">
                Resolución: {ascent?.resolution}
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-12">
                        <div className="mb-2"><b>Ascenso: </b> {ascent?.ascent}</div>
                        <div className="mb-2"><b>Tip. categoría: </b> <span className="badge badge-dark">{ascent?.type_categoria?.descripcion}</span></div>
                        <div className="mb-2"><b>Fecha Resolución: </b> {moment(ascent?.date_start).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Fecha Inicio: </b> {moment(ascent?.date_start).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Descripción: </b> {ascent?.description}</div>
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
                <EditAscent
                    onClose={() => setOption("")}
                    ascent={ascent}
                    info={info}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            </Show>
            {/* mostrar archivos */}
            <Show condicion={option == 'FILE'}>
                <ListFile
                    onClose={() => setOption(false)}
                    objectId={ascent?.id}
                    objectType="App/Models/Ascent"
                    multiple={true}
                />
            </Show>
        </div>
    )
}

export default ItemAscent;