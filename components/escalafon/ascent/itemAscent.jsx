import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import moment from 'moment'
import EditAscent from './editAscent';
import Show from '../../show';

const ItemAscent = ({ ascent, onUpdate = null, onDelete = null }) => {

    const [option, setOption] = useState("");

    return (
        <div className="card">
            <div className="card-header">
                Resolución: {ascent?.resolution}
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-12">
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
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            </Show>
        </div>
    )
}

export default ItemAscent;