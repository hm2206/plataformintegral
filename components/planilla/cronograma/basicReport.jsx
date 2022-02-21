import React, { useContext, useState, Fragment } from 'react';
import { Body, BtnSelect } from '../../Utils';
import { Form, Select } from 'semantic-ui-react';
import Show from '../../show';
import ContentControl from '../../contentControl';
import { handleErrorRequest, unujobs, microPlanilla } from '../../../services/apis';
import {
    SelectTypeCategory,
    SelectAfpCode,
    SelectTypeDiscount,
    SelectTypeRemuneration,
    SelectTypeAportation,
    SelectTypeAffiliation,
    SelectCronogramaToPimCode,
    SelectCronogramaToCargos
} from '../../select/micro-planilla';
import { AppContext } from '../../../contexts/AppContext';

const clientApi = {
    unujobs, 
    microPlanilla,
}

// selector de monto
const SelectMontos = (props) =>  <Select
    {...props}
    fluid
    placeholder="Netos"
    options={[
        { key: "SELECT_MONTO_BRUTOS", value: "false", text: "Brutos" },
        { key: "SELECT_MONTO_NETOS", value: "true", text: "Netos" }
    ]}
/>

// selector de valores
const SelectValores = (props) =>  <Select
    {...props}
    fluid
    placeholder="Todos"
    options={[
        { key: "SELECT_MONTO_ALL", value: "", text: "Todos" },
        { key: "SELECT_MONTO_POSITIVOS", value: "false", text: "Positivos" },
        { key: "SELECT_MONTO_NEGATIVOS", value: "true", text: "Negativos" }
    ]}
/>

// selector de metodo de pago
const SelectPay = (props) => {
    
    return (
        <Select
            fluid
            {...props}
            placeholder="Pago por Cuenta"
            options={[
                { key: "SELECT_MONTO_POSITIVOS", value: "false", text: "Cuenta" },
                { key: "SELECT_MONTO_NEGATIVOS", value: "true", text: "Cheque" }
            ]}
        />
    )
}

// selector de duplicado
const SelectDuplicate = (props) =>  <Select
    {...props}
    placeholder="Sin Duplicado"
    options={[
        { key: "SELECT_DUPLICATE_NOT", value: "0", text: "Sin Duplicado" },
        { key: "SELECT_DUPLICATE_YES", value: "1", text: "Duplicado" }
    ]}
/>

// botones de acciones
const getButtons = async (names = []) => {
    let datos = [
        {value: "general", text: "Generar PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/general.pdf", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "planilla", text: "Generar PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/spreadsheets.pdf?limit=200", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "boleta", text: "Generar PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/tickets.pdf?limit=200", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "boleta_airhsp", text: "Generar AIRHSP", color: "red", icon: "file text pdf", url: "pdf/boleta_airhsp/{id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "pay", text: "Generar PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/pay.pdf", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "pay-txt", text: "Descargar txt", color: "gray", icon: "download", url: "cronogramas/{id}/reports/pay.txt", params: ["id"], action: "link", download: true, api: "microPlanilla"},
        {value: "afp", text: "Generar PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/afp.pdf", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "afp-net", text: "Descargar AFP NET", color: "olive", icon: "download", url: "cronogramas/{id}/reports/afp.xlsx?private=true", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "remuneracion", text: "Generar PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/remuneration.pdf", params: ["id"], action: "link", api: "microPlanilla" },
        {value: "remuneracion-excel", text: "Generar Excel", color: "olive", icon: "file text excel", url: "cronogramas/{id}/reports/remuneration.xlsx", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "descuento", text: "Generar PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/discount.pdf", params: ["id"], action: "link", api: "microPlanilla" },
        {value: "descuento-xlsx", text: "Generar Excel", color: "olive", icon: "file text excel", url: "cronogramas/{id}/reports/discount.xlsx", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "descuento-consolidado", text: "Consolidado", color: "olive", icon: "file text excel", url: "exports/cronograma/{id}/descuento_consolidado", params: ["id"], action: "link", api: "unujobs" },
        {value: "judicial", text: "Lista Beneficiarios", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/obligation.pdf", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "judicial-pay", text: "Generar Pagos", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/obligationPay.pdf", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "judicial-pay-txt", text: "Generar txt Pagos", color: "gray", icon: "download", url: "cronogramas/{id}/reports/obligation.txt", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "affiliation", text: "Generar PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/affiliation.pdf", params: ["id"], action: "link", api: "microPlanilla" },
        {value: "affiliation-excel", text: "Generar Excel", color: "olive", icon: "file text excel", url: "cronogramas/{id}/reports/affiliation.xlsx", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "aportacion", text: "Generar PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/aportation.pdf", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "aportacion-excel", text: "Generar Excel", color: "olive", icon: "file text excel", url: "cronogramas/{id}/reports/aportation.xlsx", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "personal", text: "Generar PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/personal.pdf", params: ["id"], action: "link", api: "microPlanilla" },
        {value: "personal-excel", text: "Generar Excel", color: "olive", icon: "file text outline", url: "cronogramas/{id}/reports/personal.xlsx", params: ["id"], action: "link", api: "microPlanilla" },
        {value: "ejecucion", text: "Generar PDF", color: "red", icon: "file text excel", url: "cronogramas/{id}/reports/ejecucion.pdf", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "ejecucion-pay", text: "Generar pago PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/ejecucionPay.pdf", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "ejecucion-total", text: "Generar eje. Total PDF", color: "red", icon: "file text outline", url: "cronogramas/{id}/reports/ejecucionTotal.pdf", params: ["id"], action: "link", api: "microPlanilla"},
    ];
    // response
    let realDatos = datos.filter(d => {
        if (names.indexOf(d.value) != -1) return d;
    });
    // response
    return realDatos;
};

// filtros dinámicos
const Selectfiltros = ({ cronograma, name, value, onChange }) => {
    const filtros = {
        pimCode: <SelectCronogramaToPimCode cronogramaId={cronograma.id} value={value} name="pimCode" onChange={onChange}/>,
        cargoId: <SelectCronogramaToCargos value={value} cronogramaId={cronograma.id} name="cargoId" onChange={onChange}/>,
        typeCategoryId: <SelectTypeCategory value={value} cronograma_id={cronograma.id} name="typeCategoryId" onChange={onChange}/>,
        isCheck: <SelectPay value={`${value || "false"}`} name="isCheck" onChange={onChange}/>,
        code: <SelectAfpCode value={`${value || ''}`} cronograma_id={cronograma.id} name="code" onChange={onChange}/>,
        typeRemunerationId: <SelectTypeRemuneration value={value} cronograma_id={cronograma.id} name="typeRemunerationId" onChange={onChange}/>,
        typeDiscountId: <SelectTypeDiscount value={value} cronograma_id={cronograma.id} name="typeDiscountId" onChange={onChange}/>,
        typeAffiliationId: <SelectTypeAffiliation value={value} cronograma_id={cronograma.id} name="typeAffiliationId" onChange={onChange}/>,
        typeAportationId: <SelectTypeAportation value={value} cronograma_id={cronograma.id} name="typeAportationId" onChange={onChange}/>,
        neto: <SelectMontos value={`${value || "false"}`} name="neto" onChange={onChange}/>,
        negative: <SelectValores value={`${value || ""}`} name="negative" onChange={onChange}/>,
        duplicate: <SelectDuplicate value={`${value || ""}`} name="duplicate" onChange={onChange}/>,
    }
    // return
    return filtros[name] ? filtros[name] : null;
}

// reportes
const reports = [
    {key: "general", value: "general", text: "Reporte General", icon: "file text outline", filtros: ['pimCode', 'cargoId'], buttons: ['general']},
    {key: "planilla", value: "planilla", text: "Reporte de Planilla", icon: "file text outline", filtros: ['pimCode', 'cargoId'], buttons: ['planilla']},
    {key: "boleta", value: "boleta", text: "Reporte de Boleta", icon: "file text outline", filtros: ['pimCode', 'cargoId'], buttons: ['boleta']},
    {key: "pago", value: "pago", text: "Reporte Medio de Pago", icon: "file text outline", filtros: ['isCheck', 'typeCategoryId'], buttons: ['pay', 'pay-txt']},
    {key: "afp", value: "afp", text: "Reporte de AFP y ONP", icon: "file text outline", filtros: ['code'], buttons: ['afp', 'afp-net']},
    {key: "remuneracion", value: "remuneracion", text: "Reporte de Remuneraciones", icon: "file text outline", filtros: ['typeRemunerationId'], buttons: ['remuneracion', 'remuneracion-excel']},
    {key: "descuento", value: "descuento", text: "Reporte de Descuentos", icon: "file text outline", filtros: ['typeDiscountId'], buttons: ['descuento', 'descuento-xlsx']},
    {key: "obligacion", value: "obligacion", text: "Reporte de Obl. Judiciales", icon: "file text outline", filtros: ['isCheck', 'typeCategoryId'], buttons: ['judicial', 'judicial-pay', 'judicial-pay-txt']},
    {key: "affiliation", value: "affiliation", text: "Reporte de Afiliaciones", icon: "file text outline", filtros: ['typeAffiliationId'], buttons: ['affiliation', 'affiliation-excel']},
    {key: "aportacion", value: "aportacion", text: "Reporte de Aportaciones", icon: "file text outline", filtros: ['typeAportationId'], buttons: ['aportacion', 'aportacion-excel']},
    {key: "personal", value: "personal", text: "Reporte de Personal", icon: "file text outline", filtros: ['negative'], buttons: ['personal', 'personal-excel']},
    {key: "ejecucion", value: "ejecucion", text: "Reporte de Ejecucion de Planilla", icon: "file text outline", filtros: ['neto'], buttons: ['ejecucion', 'ejecucion-pay', 'ejecucion-total']}
];


const BasicReport = ({ cronograma, basic }) => {

    // app
    const app_context = useContext(AppContext);

    // estado
    const [form, setForm] = useState({});
    const [report_id, setReportId] = useState("");
    const [current_filtros, setCurrentFiltros] = useState([]);
    const [current_buttons, setCurrentButtons] = useState([]);

    // manejar los filtros de los reportes
    const handleFiltros = async ({ options, name, value }) => {
        setReportId(value);
        let opt = await options.filter(o => o.value === value);
        if (!opt.length) return false;
        let current_opt = opt[0];
        let tmp_buttons = await getButtons(current_opt.buttons);
        setForm({});
        setCurrentButtons(tmp_buttons);
        setCurrentFiltros(current_opt.filtros);
    }

    // cambiar inputs
    const handleInput = (e, { name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // acciones
    const handleClick = async (e, obj) => {
        app_context.setCurrentLoading(true);
        if (obj.action == 'link') {
            let api = clientApi[obj.api];
            let query = genetateQuery();
            let link = await handleUrl(obj.url, obj.params);
            let simbol = /[?]/.test(link)  ? '&' : '?';
            let a = document.createElement('a');
            a.href = `${api.path}/${link}${simbol}${query}`;
            a.target = '_blank';
            a.click();
            app_context.setCurrentLoading(false);
        } else if (obj.action == 'blob') {
            let params = genetateQuery(false);
            let link = await handleUrl(obj.url, obj.params);
            await unujobs.post(link, params)
            .then(res => {
                app_context.setCurrentLoading(false);
                let { message } = res.data;
                if (message) throw new Error(message);
                let array = res.headers['content-type'].split(';');
                let filename = array.length == 0 ? obj.name || null : array[array.length == 1 ? 0 : array.length - 1];
                let a = document.createElement('a');
                let type = obj.type;
                let blob = new Blob([res.data], { type });
                a.href = URL.createObjectURL(blob);
                obj.download ? a.download = filename : null;
                a.target = '_blank';
                a.click();
            }).catch(err => handleErrorRequest(err, null, (e) => app_context.setCurrentLoading(false)));
        }   
    }

    // manejador de url
    const handleUrl = async (url, params) => {
        let newUrl = "";
        for(let param of params) {
            if (param == 'id')  {
                newUrl = await url.replace(`{${param}}`, cronograma[param]);
            } else {
                newUrl = await url.replace(`{${param}}`, form[param]);
            }
        }
        return newUrl;
    }

    const genetateQuery = (_string = true) => {
        let query = ``;
        let index = 0;
        let payload = {};
        for (let obj in form) {
            const value = form[obj];
            console.log(value);
            if (!value) continue;
            query += index == 0 ? `${obj}=${form[obj]}` : `&${obj}=${form[obj]}`;
            payload[obj] = form[obj];
            index++;
        }
        // response
        return _string ? query : payload;
    }

    return(<Fragment>
                <div className="col-md-12">
                    <Body>
                        <Form>
                            <div className="row">
                                <div className="col-md-3 col-lg-3 mb-1">
                                    <Form.Field>
                                        <Select
                                            fluid
                                            placeholder="Select. Reporte"
                                            value={report_id || ""}
                                            options={reports}
                                            onChange={(e, obj) => handleFiltros(obj)}
                                        />
                                    </Form.Field>
                                </div>

                                {current_filtros.map((obj, index) => 
                                    <div className="col-md-3 mb-1" key={`filtro-${obj.key}-${index}`}>
                                        <Form.Field>
                                            <Selectfiltros
                                                name={obj}
                                                onChange={handleInput}
                                                value={form[obj]}
                                                cronograma={cronograma}
                                            />
                                        </Form.Field>
                                    </div>    
                        )}

                                <div className="col-md-12 text-center mt-5">
                                    <h1 className="mt-4" style={{ color: "#eee" }}>
                                        <i className="fas fa-file-alt" style={{ fontSize: "3em" }}></i>
                                        <br/>
                                        Reportes <br/> 
                                        del Cronograma <br/> 
                                        #{cronograma && cronograma.id}
                                    </h1>
                                </div>
                            </div>
                        </Form>
                    </Body>
                </div>
                    
                <Show condicion={basic}
                    predeterminado={
                        <ContentControl>
                            <div className="col-md-3">
                                <BtnSelect
                                    color="black"
                                    fluid
                                    options={current_buttons || []}
                                    onClick={handleClick}
                                    disabled={!report_id}
                                    refresh={report_id}
                                />
                            </div>
                        </ContentControl>
                    }
                >
                    <div style={{ position: 'absolute', bottom: '3em', right: '10px' }} className="w-100">
                        <div className="row justify-content-end">
                            <div className="col-md-4">
                                <div style={{ position: 'relative', paddingBottom: '0.5em' }}>
                                    <BtnSelect
                                        color="black"
                                        fluid
                                        options={current_buttons || []}
                                        onClick={handleClick}
                                        disabled={!report_id}
                                        refresh={report_id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Show>
    </Fragment>)
}

// exportar
export default BasicReport;
