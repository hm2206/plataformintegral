import React, { useMemo, useState, useEffect, useContext } from 'react'
import Modal from '../../modal'
import { Button } from 'semantic-ui-react'
import Show from '../../show'
import FormSchedule from '../schedule/formSchedule'
import { Confirm } from '../../../services/utils'
import { AppContext } from '../../../contexts/AppContext'
import ScheduleProvider from '../../../providers/escalafon/ScheduleProvider'
import Swal from 'sweetalert2'
import { DiscountContext } from '../../../contexts/escalafon/DiscountContext'
import { discountTypes } from '../../../contexts/escalafon/DiscountReducer'

// providers
const scheduleProvider = new ScheduleProvider();

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

const ItemInfoSchedule = ({ onClose = null, date = {}, info = {} }) => {

    // discount
    const { dispatch, config_discount } = useContext(DiscountContext)

    const [current_schedule, setCurrentSchedule] = useState({})
    const [errors, setErrors] = useState({})
    const [current_edit, setCurrentEdit] = useState(false)

    const app_context = useContext(AppContext)

    const handleInput = (e, { name, value }) => {
        let newForm = Object.assign({}, current_schedule);
        newForm[name] = value;
        setCurrentSchedule(newForm)
        let newErrors = Object.assign({}, errors)
        newErrors[name] = [];
        setErrors(newErrors)
        setCurrentEdit(true)
    }

    const handleIsEdit = async () => {
        let answer = await Confirm('warning', '¿Estás seguro en guardar los cambios?', 'Guardar Cambios');
        if (!answer) return;
        app_context.setCurrentLoading(true)
        let payload = Object.assign({}, current_schedule);
        payload.discount_id = info.discount_id;
        await scheduleProvider.isEdit(current_schedule?.id, payload)
        .then(async res => {
            let updateSchedule = res?.data?.schedule || {};
            let discount = res?.data?.discount || {};
            app_context.setCurrentLoading(false)
            await Swal.fire({ icon: 'success', text: 'Los cambios se guardaron correctamente' })
            setCurrentSchedule(prev => ({ ...prev, ...updateSchedule }))
            let updateInfo = discount;
            updateInfo.id = info.id;
            dispatch({ type: discountTypes.UPDATE_INFO, payload: updateInfo })
            dispatch({ type: discountTypes.UPDATE_SCHEDULE, payload: updateSchedule })
        }).catch(() => {
            app_context.setCurrentLoading(false)
            Swal.fire({ icon: 'error', text: 'No se pudó guardar los cambios' })
        })
    }

    const canEdit = useMemo(() => {
        return config_discount?.status == 'START';
    }, [config_discount?.status]);

    useEffect(() => {
        setCurrentSchedule(date?.schedule || {})
    }, [date?.schedule])

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
                    <Show condicion={date?.schedule}>
                        <div className="card-body">
                            <FormSchedule
                                readOnly={['date', 'modo', 'time_start', 'time_over', 'delay_start']}
                                form={current_schedule}
                                onChange={handleInput}
                                disabled={!canEdit}
                            >
                                <Show condicion={canEdit && current_edit}>
                                    <div className="col-md-12 text-right">
                                        <hr />
                                        <Button color="blue" onClick={handleIsEdit}>
                                            <i className="fas fa-sync"></i> Actualizar
                                        </Button>
                                    </div>
                                </Show>
                            </FormSchedule>
                        </div>
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