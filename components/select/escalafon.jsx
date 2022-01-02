import React from 'react';
import { SelectBase } from './utils';
import { escalafon } from '../../services/apis';
import moment from 'moment'


const SelectAfp = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={escalafon}
        url={`afps`}
        id={`select-afp-${id}-${name}`}
        value={id}
        text="description"
        obj="afps"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Ley Social"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectBanco = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={escalafon}
        url={`bancos`}
        id={`select-banco-${id}-${name}`}
        value={id}
        text="nombre"
        obj="bancos"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Banco"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectConfigAssistance = ({ id = "id", year, month, name, value, onChange, error = false, refresh = true, onReady = null }) => {
    return <SelectBase 
        execute={true}
        api={escalafon}
        url={`config_assistances?year=${year}&month=${month}`}
        id={`select-config_assistances-${name}`}
        value={id}
        text="date"
        obj="config_assistances"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Configuración de Asistencia"
        refresh={refresh}
        onReady={onReady}
        error={error}
    />
}

const SelectInfoSchedule = ({ id = "id", info_id, year, month, name, value, onChange, error = false, refresh = true, onReady = null, disabled = false }) => {

    const displayText = (el) => {
        let time_start = moment(el?.time_start, 'HH:mm').format('HH:mm A');
        let time_over = moment(el?.time_over, 'HH:mm').format('HH:mm A');
        let textAll = `Entrada: ${time_start} Salida: ${time_over}`;
        let textEntry = `Entrada: ${time_start}`;
        let textExit = `Salida: ${time_over}`;
        let textTime = el.modo == 'ALL' ? textAll : el.modo == 'ENTRY' ? textEntry : textExit;
        return `${el?.date} | ${textTime}`
    }

    return <SelectBase 
        execute={true}
        api={escalafon}
        url={`infos/${info_id}/schedules?year=${year}&month=${month}`}
        id={`select-info-schedules-${name}`}
        value={id}
        text="date"
        obj="schedules"
        displayText={displayText}
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Horario"
        refresh={refresh}
        onReady={onReady}
        error={error}
        disabled={disabled}
    />
}

const SelectWorkConfigVacation = ({ id = "id", work_id, name, value, onChange, error = false, refresh = true, onReady = null, displayText = null }) => {

    const defaultDisplayText = (el) => {
        if (typeof displayText == 'function') return displayText(el); 
        return `${el.year} | Días programados: ${el.scheduled_days}`;
    }

    return <SelectBase 
        execute={true}
        api={escalafon}
        url={`works/${work_id}/config_vacations`}
        id={`select-config_vacations-${name}`}
        value={id}
        text="year"
        obj="config_vacations"
        displayText={defaultDisplayText}
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Configuración de Vacación"
        refresh={refresh}
        onReady={onReady}
        error={error}
    />
}

const SelectTypePermission = ({ id = "id", name, value, onChange, error = false, refresh = true, onReady = null }) => {
    return <SelectBase 
        execute={true}
        api={escalafon}
        url={`type_permissions`}
        id={`select-type_permissions-${name}`}
        value={id}
        text="description"
        obj="type_permissions"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Tipo. Permiso"
        refresh={refresh}
        onReady={onReady}
        error={error}
    />
}

const SelectWorkInfo = ({ 
    id = "id", work_id, estado = null, principal = null, name, value, onChange, error = false,
    refresh = true, onReady = null, displayText = null, defaultValue = null, onDefaultValue = null
}) => {

    const queryString = () => {
        let query = "";
        if (estado != null) query += `estado=${estado}&`;
        if (principal != null) query += `principal=${principal}&`
        return query;
    }

    const defaultDisplayText = (el) => {
        if (typeof displayText == 'function') return displayText(el)
        return `${el?.estado ? 'Activo' : 'Terminado'} : ${el?.planilla?.nombre} - ${el?.type_categoria?.descripcion}`;
    }

    return <SelectBase 
        execute={true}
        api={escalafon}
        url={`works/${work_id}/infos?${queryString()}`}
        id={`select-work-infos${name}`}
        value={id}
        text="fecha_de_ingreso"
        obj="infos"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Contrato"
        refresh={refresh}
        onReady={onReady}
        displayText={defaultDisplayText}
        defaultValue={defaultValue}
        onDefaultValue={onDefaultValue}
        error={error}
    />
}

const SelectTypeDegree = ({ id = "id", name, value, onChange, error = false, refresh = true, onReady = null }) => {
    return <SelectBase 
        execute={true}
        api={escalafon}
        url={`type_degrees`}
        id={`select-type_degrees-${name}`}
        value={id}
        text="name"
        obj="type_degrees"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Tipo. Grado"
        refresh={refresh}
        onReady={onReady}
        error={error}
    />
}


const SelectConfigDiscount = ({ id = "id", year = null, name, value, onChange, error = false, refresh = true, onReady = null, displayText = null }) => {

    const defaultDisplayText = (el) => {
        if (typeof displayText == 'function') return displayText(el)
        return `${ moment(`${el?.year}-${el?.month}`, 'YYYY-MM').format('MMMM')}`.toUpperCase();
    }

    return <SelectBase 
        execute={true}
        api={escalafon}
        url={`config_discounts?query_search=${year}`}
        id={`select-config_discounts-${name}`}
        value={id}
        text="name"
        obj="config_discounts"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Config. Descuento"
        refresh={refresh}
        displayText={defaultDisplayText}
        onReady={onReady}
        error={error}
    />
}

const SelectHourhand = ({ id = "id", name, value, onChange, error = false, refresh = true, onReady = null, displayText = null }) => {

    return <SelectBase 
        execute={true}
        api={escalafon}
        url={`hourhands`}
        id={`select-hourhand-${name}`}
        value={id}
        text="name"
        obj="hourhand"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Horario"
        refresh={refresh}
        displayText={displayText}
        onReady={onReady}
        error={error}
    />
}

export { 
    SelectAfp,
    SelectBanco,
    SelectConfigAssistance,
    SelectInfoSchedule,
    SelectWorkConfigVacation,
    SelectTypePermission,
    SelectWorkInfo,
    SelectTypeDegree,
    SelectConfigDiscount,
    SelectHourhand,
};