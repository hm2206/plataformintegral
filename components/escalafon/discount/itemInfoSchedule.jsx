import React, { useMemo } from 'react'
import Modal from '../../modal'
import { Input, Select } from 'semantic-ui-react'
import Show from '../../show'

const ItemVacation = ({ item = {} }) => {
    return (
        <>
            <div className="mb-1">Resolución: <span className="badge badge-primary">{item?.resolucion}</span></div>
            <div className="mb-1">F. Inicio: {item?.date_start}</div>
            <div className="mb-1">F. Termino: {item?.date_over}</div>
            <div className="mb-1">Días Usados: <span className="badge badge-dark">{item?.days_used}</span></div>
            <div className="mb-1">Observación: {item?.observation}</div>
        </>
    )
}

const ItemBallot = ({ item = {} }) => {
    return (
        <>
            <div className="mb-1">N° Papeleta: <span className="badge badge-primary">{item?.ballot_number}</span></div>
            <div className="mb-1">Motivo: {item?.motivo}</div>
            <div className="mb-1">Aplica descuento: <span className="badge badge-light">{item?.is_applied ? 'Si' : 'No'}</span></div>
            <div className="mb-1">Justificación: {item?.justification}</div>
        </>
    )
}

const ItemPermission = ({ item = {} }) => {
    return (
        <>
            <div className="mb-1">Tipo Permiso: <span className="badge badge-primary">{item?.type_permission?.description}</span></div>
            <div className="mb-1">Tipo Documento: <span className="badge badge-dark">{item?.option}</span></div>
            <div className="mb-1">N° Documento: {item?.document_number}</div>
            <div className="mb-1">Fecha Inicio: {item?.date_start}</div>
            <div className="mb-1">Fecha Termino: {item?.date_over}</div>
            <div className="mb-1">Justificación: {item?.justification}</div>
        </>
    )
}

const ItemLicense = ({ item = {} }) => {
    return (
        <>
            <div className="mb-1">Licencia: <span className="badge badge-primary">{item?.situacion_laboral?.nombre}</span></div>
            <div className="mb-1">N° Resolución: {item?.resolution}</div>
            <div className="mb-1">Fecha Resolución: {item?.date_resolution}</div>
            <div className="mb-1">Fecha Inicio: {item?.date_start}</div>
            <div className="mb-1">Fecha Termino: {item?.date_over}</div>
            <div className="mb-1">Días Usados: <span className="badge badge-dark">{item?.days_used}</span></div>
            <div className="mb-1">Con Gose: {item?.is_pay ? 'Si' : 'No'}</div>
            <div className="mb-1">Descripción: {item?.description}</div>
        </>
    )
}

const ItemDetalle = ({ detalle = {} }) => {

    const allowItems = {
        "App/Models/Vacation": <ItemVacation item={detalle?.object}/>,
        "App/Models/Ballot": <ItemBallot item={detalle?.object}/>,
        "App/Models/Permission": <ItemPermission item={detalle?.object}/>,
        "App/Models/License": <ItemLicense item={detalle?.object}/>
    }

    const ComponentItem = useMemo(() => {
        return allowItems[detalle?.type] || null
    }, [detalle]);
 
    return (
        <div className="card">
            <div className="card-body">
                {ComponentItem}
            </div>
        </div>
    )
}

const ItemInfoSchedule = ({ onClose = null, date = {} }) => {

    return (
        <Modal show={true}
            isClose={onClose}
            titulo={
                <span className="font-15 text-left">
                    <i className="fas fa-info"></i> Información Detallada
                </span>
            }
        >
            <div className="card-body font-14 text-left">
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <label>Fecha</label>
                        <Input type="date" 
                            fluid
                            value={date?.date}
                            readOnly
                        />
                    </div>
                    
                    <Show condicion={date?.schedule}>
                        <div className="col-12">
                            <hr />
                            <h4 className="mt-1"><i className="fas fa-calendar"></i> Horario</h4>
                            <hr />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label>Modo</label>
                            <Select disabled
                                value={date?.schedule?.modo}
                                options={[
                                    { key: "ALL", value: "ALL", text: "Entrada/Salida" },
                                    { key: "ENTRY", value: "ENTRY", text: "Entrada" },
                                    { key: "EXIT", value: "EXIT", text: "Salida" }
                                ]}
                            />
                        </div>
                        
                        <Show condicion={date?.schedule?.time_start}>
                            <div className="col-md-6">
                                <label>Hora de Ingreso</label>
                                <Input type="time" 
                                    fluid
                                    value={date?.schedule?.time_start}
                                    readOnly
                                />
                            </div>
                        </Show>

                        <Show condicion={date?.schedule?.time_over}>
                            <div className="col-md-6">
                                <label>Hora de Salida</label>
                                <Input type="time" 
                                    fluid
                                    value={date?.schedule?.time_over}
                                    readOnly
                                />
                            </div>
                        </Show>

                        <Show condicion={date?.schedule?.time_over}>
                            <div className="col-md-6">
                                <label>Descuento <small>(MIN)</small></label>
                                <Input type="text" 
                                    fluid
                                    value={date?.schedule?.discount}
                                    readOnly
                                />
                            </div>
                        </Show>
                    </Show>

                    <Show condicion={date?.discounts?.length}>
                        <div className="col-12">
                            <hr />
                            <h4 className="mt-1"><i className="fas fa-file-alt"></i> Detalles</h4>
                            <hr />
                        </div>    
                    </Show>

                    {date?.discounts?.map((dis, indexD) => 
                        <div className="col-12" key={`list-item-discount-${indexD}`}>
                            <ItemDetalle detalle={dis}/>
                        </div>    
                    )}
                </div>
            </div>
        </Modal>
    )
}

export default ItemInfoSchedule;