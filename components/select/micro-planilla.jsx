import React, { useMemo } from 'react';
import { SelectBase } from './utils';
import { microAuth, microPlanilla, microScale } from '../../services/apis';


const SelectPlanilla = ({ id = "id", principal = undefined, name, value, onChange, refresh = false, disabled = false }) => {
    
    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (typeof principal != 'undefined') {
            params.set('principal', principal);
        }

        return params.toString();
    }, [principal])
    
    return <SelectBase 
        api={microPlanilla}
        url={`planillas?${queryString}`}
        id={`select-planillas-${id}-${name}`}
        value={id}
        text="name"
        obj="planillas"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Planillas"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectMeta = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`metas`}
        id={`select-metas-${id}-${name}`}
        value={id}
        text="name"
        obj="metas"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Planillas"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectCargo = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`cargos`}
        id={`select-cargos-${id}-${name}`}
        value={id}
        text="name"
        obj="cargos"
        name={name}
        displayText={(data) => (`${data.name} | ${data.extension}`)}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Partición Presp."
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectTypeAffiliation = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`typeAffiliations`}
        id={`select-type_affiliations-${id}-${name}`}
        value={id}
        text="name"
        obj="typeAffiliations"
        displayText={(data) => `${data?.typeDiscount?.code}.- ${data?.name}`}
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Tip. Afiliación"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectPim = ({ id = "id", year, active, defaultDatos = [], name, value, onChange, refresh = false, disabled = false, displayText = null }) => {
    
    const handleDisplayText = (data) => {
        if (typeof displayText == 'function') {
            return displayText(data);
        }
        return `Meta ${data?.code} [${data?.cargo?.extension || ''} - ${data?.cargo?.name || ''}]`;
    }

    return <SelectBase 
        active={active}
        api={microPlanilla}
        url={`pims?year=${year}`}
        id={`select-pims-${id}-${name}`}
        value={id}
        defaultDatos={defaultDatos}
        text="name"
        obj="pims"
        name={name}
        displayText={handleDisplayText}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar PIM"
        refresh={refresh || year}
        execute={true}
        disabled={disabled}
    />
}

const SelectPimCode = ({ id = "code", year, active, defaultDatos = [], name, value, onChange, refresh = false, disabled = false }) => {

    return <SelectBase 
        active={active}
        api={microPlanilla}
        url={`pims/toCode?year=${year}`}
        id={`select-pims-code-${id}-${name}`}
        value={id}
        defaultDatos={defaultDatos}
        text="code"
        obj="pims"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar PIM CODE"
        refresh={refresh || year}
        execute={true}
        disabled={disabled}
    />
}

const SelectAfp = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microScale}
        url={`afps`}
        id={`select-afp-${id}-${name}`}
        value={id}
        displayText={(data) => data.isPrivate ? `${data.name} - ${data.typeAfp}` : data.name}
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

const SelectAfpCode = ({ id = "code", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microScale}
        url={`afps/toCodes`}
        id={`select-afp-code-${id}-${name}`}
        value={id}
        displayText={(data) => data.name}
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

const SelectBank = ({ id = "id", name, active = false, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microAuth}
        url={`banks`}
        id={`select-banks-${id}-${name}`}
        value={id}
        text="name"
        obj="bancos"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Banco"
        refresh={refresh}
        execute={true}
        disabled={disabled}
        active={active}
    />
}

const SelectTypeCargo = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`typeCargos`}
        id={`select-type-cargos-${id}-${name}`}
        value={id}
        text="name"
        obj="typeCargos"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Tipo Trabajador"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectTypeCategory = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microScale}
        url={`typeCategories`}
        id={`select-type-category-${id}-${name}`}
        value={id}
        text="name"
        obj="typeCategories"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Categoría"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectDependency = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`dependencies`}
        id={`select-dependency-${id}-${name}`}
        value={id}
        text="name"
        obj="dependencies"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Dependencia"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectProfile = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`profiles`}
        id={`select-profile-${id}-${name}`}
        value={id}
        text="name"
        obj="profiles"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Perfil"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectHourhand = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`hourhands`}
        id={`select-hourhand-${id}-${name}`}
        value={id}
        text="name"
        obj="hourhands"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Horario"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectWorkToContract = ({ id = "id", workId, name, value, onChange, onReady, refresh = false, disabled = false, displayText = null }) => {
    return <SelectBase 
        api={microScale}
        url={`works/${workId}/contracts`}
        id={`select-work-contracts-${id}-${name}`}
        value={id}
        text="resolution"
        obj="contracts"
        name={name}
        displayText={displayText}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Contrato"
        refresh={refresh}
        execute={true}
        disabled={disabled}
        onReady={onReady}
    />
}

const SelectTypeRemuneration = ({ id = "id", name, value, onChange, refresh = false, disabled = false, displayText = null }) => {
    
    const handleDisplayText = (el) => {
        if (typeof displayText == "function") return displayText(el);
        return `${el.code}.- ${el.name}`;
    }

    return <SelectBase 
        api={microPlanilla}
        url={`typeRemunerations`}
        id={`select-type-remunerations-${id}-${name}`}
        value={id}
        text="name"
        obj="typeRemunerations"
        name={name}
        displayText={handleDisplayText}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Tip. Remuneración"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectTypeDiscount = ({ id = "id", name, value, onChange, refresh = false, disabled = false, displayText = null }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`typeDiscounts`}
        id={`select-type-discount-${id}-${name}`}
        value={id}
        text="description"
        obj="typeDiscounts"
        name={name}
        displayText={(data) => (`${data.code}.- ${data.description}`)}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Tip. Descuentos"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectTypeAportation = ({ id = "id", name, value, onChange, refresh = false, disabled = false, displayText = null }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`typeAportations`}
        id={`select-type-aportation-${id}-${name}`}
        value={id}
        text="name"
        obj="typeAportations"
        name={name}
        displayText={(data) => (`${data.code}.- ${data.name}`)}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Tip. Aportacion"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectCronogramaToPims = ({ id = "id", cronogramaId, active, defaultDatos = [], name, value, displayText, onChange, refresh = false, disabled = false }) => {
    
    const handleDisplayText = (data) => {
        if (typeof displayText == 'function') {
            return displayText(data);
        }
        return `Meta ${data?.code} [${data?.cargo?.extension || ''} - ${data?.cargo?.name || ''}]`;
    }
    
    return <SelectBase 
        active={active}
        api={microPlanilla}
        url={`cronogramas/${cronogramaId}/pims`}
        id={`select-cronogramas-pims-${id}-${name}`}
        value={id}
        defaultDatos={defaultDatos}
        text="code"
        obj="pims"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar PIM"
        refresh={refresh || cronogramaId}
        execute={true}
        displayText={handleDisplayText}
        disabled={disabled}
    />
}

const SelectCronogramaToPimCode = ({ id = "code", cronogramaId, year, active, defaultDatos = [], name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        active={active}
        api={microPlanilla}
        url={`cronogramas/${cronogramaId}/pimCode`}
        id={`select-cronogramas-pims-code-${id}-${name}`}
        value={id}
        defaultDatos={defaultDatos}
        text="code"
        obj="pims"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar PIM CODE"
        refresh={refresh || year}
        execute={true}
        disabled={disabled}
    />
}

const SelectCronogramaToCargos = ({ id = "id", cronogramaId, year, active, defaultDatos = [], name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        active={active}
        api={microPlanilla}
        url={`cronogramas/${cronogramaId}/cargos`}
        id={`select-cronogramas-cargos-${id}-${name}`}
        value={id}
        defaultDatos={defaultDatos}
        text="name"
        obj="cargos"
        displayText={(data) => `${data.name} [${data.extension}]`}
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar extensión"
        refresh={refresh || year}
        execute={true}
        disabled={disabled}
    />
}

const SelectListYearToWork = ({ id = "year", workId, active, displayText, defaultDatos = [], name, value, onChange, refresh = false, disabled = false }) => {
    const handleDisplayText = (data) => {
        if (typeof displayText == 'function') {
            return displayText(data);
        }
        return `${data?.year} [${data?.historialCounts} pagos]`;
    }
    
    return <SelectBase 
        active={active}
        api={microPlanilla}
        url={`works/${workId}/listYear`}
        id={`select-works-list-year-${id}-${name}`}
        value={id}
        defaultDatos={defaultDatos}
        text="year"
        obj="items"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Año"
        refresh={refresh}
        execute={true}
        disabled={disabled}
        displayText={handleDisplayText}
    />
}

export { 
    SelectMeta,
    SelectPimCode,
    SelectCargo,
    SelectAfp,
    SelectBank,
    SelectTypeCargo,
    SelectTypeCategory,
    SelectDependency,
    SelectProfile,
    SelectHourhand,
    SelectWorkToContract,
    SelectPlanilla,
    SelectPim,
    SelectTypeRemuneration,
    SelectTypeDiscount,
    SelectTypeAportation,
    SelectTypeAffiliation,
    SelectAfpCode,
    SelectCronogramaToPimCode,
    SelectCronogramaToCargos,
    SelectCronogramaToPims,
    SelectListYearToWork,
};