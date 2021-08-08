import React, { useMemo, useState } from 'react';
import { Button } from 'semantic-ui-react';
import moment from 'moment'
import EditLicense from './editMerit';
import ListFile from '../file/listFile';
import Show from '../../show';

const ItemMerit = ({ merit, onUpdate = null, onDelete = null }) => {

    const [option, setOption] = useState("");

    const metaData = useMemo(() => {
        let displayText = merit?.modo == 'MERIT' ? 'Mérito' : 'Démerito'
        let className = merit.modo == 'MERIT' ? 'badge-success' : 'badge-danger'
        return { displayText, className }
    }, [merit])

    return (
        <div className="card">
            <div className="card-header">
                Titulo: {merit?.title}
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-12">
                        <div className="mb-2"><b>Documento que autoriza: </b> <b><u>{merit?.resolution}</u></b></div>
                        <div className="mb-2"><b>Fecha Documento que autoriza: </b> {moment(merit?.date_resolution).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Modo: </b> <span className={`badge ${metaData?.className}`}>{metaData?.displayText}</span></div>
                        <div className="mb-2"><b>Fecha: </b> {moment(merit?.date).format('DD/MM/YYYY')}</div>
                        <div className="mb-2"><b>Descripción: </b> {merit?.description}</div>
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
                    merit={merit}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            </Show>
            {/* mostrar archivos */}
            <Show condicion={option == 'FILE'}>
                <ListFile
                    onClose={() => setOption(false)}
                    objectId={merit?.id}
                    objectType="App/Models/Merit"
                    multiple={true}
                />
            </Show>
        </div>
    )
}

export default ItemMerit;