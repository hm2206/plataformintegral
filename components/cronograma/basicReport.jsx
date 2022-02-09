import React, { useContext, useState, Fragment } from 'react';
import { Body, BtnSelect } from '../Utils';
import { InputCredencias, InputAuth, InputEntity } from '../../services/utils';
import { Form, Select } from 'semantic-ui-react';
import Show from '../show';
import ContentControl from '../contentControl';
import { handleErrorRequest, unujobs, microPlanilla } from '../../services/apis';
import {
    SelectCronogramaAfp, SelectCronogramaMeta, SelectCronogramaCargo, SelectCronogramaTypeCategoria, 
    SelectCronogramaTypeRemuneracion, SelectCronogramaTypeDescuento, SelectCronogramaTypeDetalle,
    SelectCronogramaTypeAportacion
} from '../select/cronograma';
import { AppContext } from '../../contexts/AppContext';

const clientApi = {
    unujobs, 
    microPlanilla,
}

// selector de monto
const SelectMontos = (props) =>  <Select
    {...props}
    placeholder="Todos"
    options={[
        { key: "SELECT_MONTO_ALL", value: "", text: "Todos" },
        { key: "SELECT_MONTO_BRUTOS", value: "0", text: "Brutos" },
        { key: "SELECT_MONTO_NETOS", value: "1", text: "Netos" }
    ]}
/>

// selector de valores
const SelectValores = (props) =>  <Select
    {...props}
    placeholder="Todos"
    options={[
        { key: "SELECT_MONTO_ALL", value: "", text: "Todos" },
        { key: "SELECT_MONTO_POSITIVOS", value: "0", text: "Positivos" },
        { key: "SELECT_MONTO_NEGATIVOS", value: "1", text: "Negativos" }
    ]}
/>

// selector de metodo de pago
const SelectPay = (props) =>  <Select
    {...props}
    placeholder="Pago por Cheque"
    options={[
        { key: "SELECT_MONTO_POSITIVOS", value: "1", text: "Cuenta" },
        { key: "SELECT_MONTO_NEGATIVOS", value: "0", text: "Cheque" }
    ]}
/>

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
        {value: "general", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/general/{id}", params: ["id"], action: "link", api: "unujobs"},
        {value: "general-excel", text: "Generar Excel", color: "olive", icon: "file text excel", url: "cronogramas/{id}/report/general.xlsx", params: ["id"], action: "link", api: "microPlanilla"},
        {value: "planilla", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/planilla/{id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "planilla-excel", text: "Generar Excel", color: "olive", icon: "file text excel", url: "pdf/planilla/{id}?format=excel", params: ["id"], action: "link", api: "unujobs"},
        {value: "boleta", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/boleta?cronograma_id={id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "boleta_airhsp", text: "Generar AIRHSP", color: "red", icon: "file text pdf", url: "pdf/boleta_airhsp/{id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "pay", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/pago/{id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "pay-txt", text: "Descargar txt", color: "gray", icon: "download", url: "pdf/pago/{id}?format=txt", params: ["id"], action: "blob", type: "text/plain", download: true, api: "unujobs"},
        {value: "pay-csv", text: "Descargar csv", color: "olive", icon: "download", url: "pdf/pago/{id}?format=csv", params: ["id"], action: "blob", type: "text/csv", download: true, api: "unujobs"},
        {value: "afp", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/afp/{id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "afp-net", text: "Descargar AFP NET", color: "olive", icon: "download", url: "pdf/afp_net/{id}", params: ["id"], action: "link", api: "unujobs"},
        {value: "remuneracion", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/remuneracion/{id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "descuento", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/descuento/{id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "descuento-csv", text: "Exportar a Excel", color: "olive", icon: "file text excel", url: "pdf/descuento/{id}?format=excel", params: ["id"], action: "link", api: "unujobs" },
        {value: "descuento-consolidado", text: "Consolidado", color: "olive", icon: "file text excel", url: "exports/cronograma/{id}/descuento_consolidado", params: ["id"], action: "link", api: "unujobs" },
        {value: "judicial", text: "Lista Beneficiarios", color: "red", icon: "file text outline", url: "pdf/judicial/{id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "judicial-pay", text: "Generar Pagos", color: "red", icon: "file text outline", url: "pdf/judicial/{id}/pago", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "judicial-pay-txt", text: "Generar txt Pagos", color: "gray", icon: "download", url: "pdf/judicial/{id}/pago?format=txt", params: ["id"], action: "blob", type: "text/plain", download: true, api: "unujobs"},
        {value: "detalle", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/detalle/{id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "aportacion", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/aportacion/{id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "personal", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/personal/{id}", params: ["id"], action: "blob", type: "text/html", api: "unujobs"},
        {value: "personal-csv", text: "Descargar csv", color: "olive", icon: "download", url: "pdf/personal/{id}?format=csv", params: ["id"], action: "blob", type: "text/csv", download: true, api: "unujobs"},
        {value: "ejecucion", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/ejecucion/{id}", params: ["id"], action: "link", api: "unujobs"},
        {value: "ejecucion-pay", text: "Generar pago PDF", color: "red", icon: "file text outline", url: "pdf/ejecucion/{id}/pago", params: ["id"], action: "link", api: "unujobs"},
        {value: "ejecucion-total", text: "Generar eje. Total PDF", color: "red", icon: "file text outline", url: "pdf/ejecucion/{id}/total", params: ["id"], action: "link", api: "unujobs"},
        {value: "compromiso-siaf", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/compromiso_siaf/{id}", params: ["id"], action: "link", api: "unujobs"},
    ];
    // response
    let realDatos = await datos.filter(d => {
        if (names.indexOf(d.value) != -1) return d;
    });
    // response
    return realDatos;
};

// filtros dinámicos
const Selectfiltros = ({ cronograma, name, value, onChange }) => {
    const filtros = {
        meta_id: <SelectCronogramaMeta value={value} name="meta_id" cronograma_id={cronograma.id} onChange={onChange}/>,
        cargo_id: <SelectCronogramaCargo value={value} cronograma_id={cronograma.id} name="cargo_id" onChange={onChange}/>,
        type_categoria_id: <SelectCronogramaTypeCategoria value={value} cronograma_id={cronograma.id} name="type_categoria_id" onChange={onChange}/>,
        pago_id: <SelectPay value={`${value || ""}`} name="pago_id" onChange={onChange}/>,
        afp_id: <SelectCronogramaAfp value={value} cronograma_id={cronograma.id} name="afp_id" onChange={onChange}/>,
        type_remuneracion_id: <SelectCronogramaTypeRemuneracion value={value} cronograma_id={cronograma.id} name="type_remuneracion_id" onChange={onChange}/>,
        type_descuento_id: <SelectCronogramaTypeDescuento value={value} cronograma_id={cronograma.id} name="type_descuento_id" onChange={onChange}/>,
        type_detalle_id: <SelectCronogramaTypeDetalle value={value} cronograma_id={cronograma.id} name="type_detalle_id" onChange={onChange}/>,
        type_aportacion_id: <SelectCronogramaTypeAportacion value={value} cronograma_id={cronograma.id} name="type_aportacion_id" onChange={onChange}/>,
        neto: <SelectMontos value={`${value || ""}`} name="neto" onChange={onChange}/>,
        negativo: <SelectValores value={`${value || ""}`} name="negativo" onChange={onChange}/>,
        duplicate: <SelectDuplicate value={`${value || ""}`} name="duplicate" onChange={onChange}/>,
    }
    // return
    return filtros[name] ? filtros[name] : null;
}

// reportes
const reports = [
    {key: "general", value: "general", text: "Reporte General", icon: "file text outline", filtros: ['meta_id', 'cargo_id'], buttons: ['general', 'general-excel']},
    {key: "planilla", value: "planilla", text: "Reporte de Planilla", icon: "file text outline", filtros: ['meta_id', 'cargo_id'], buttons: ['planilla', 'planilla-excel']},
    {key: "boleta", value: "boleta", text: "Reporte de Boleta", icon: "file text outline", filtros: ['meta_id', 'cargo_id', 'duplicate'], buttons: ['boleta', 'boleta_airhsp']},
    {key: "pago", value: "pago", text: "Reporte Medio de Pago", icon: "file text outline", filtros: ['pago_id', 'type_categoria_id'], buttons: ['pay', 'pay-txt', 'pay-csv']},
    {key: "afp", value: "afp", text: "Reporte de AFP y ONP", icon: "file text outline", filtros: ['afp_id'], buttons: ['afp', 'afp-net']},
    {key: "remuneracion", value: "remuneracion", text: "Reporte de Remuneraciones", icon: "file text outline", filtros: ['type_remuneracion_id', 'cargo_id', 'type_categoria_id', 'meta_id', 'negativo'], buttons: ['remuneracion']},
    {key: "descuento", value: "descuento", text: "Reporte de Descuentos", icon: "file text outline", filtros: ['type_descuento_id'], buttons: ['descuento', 'descuento-csv', 'descuento-consolidado']},
    {key: "obligacion", value: "obligacion", text: "Reporte de Obl. Judiciales", icon: "file text outline", filtros: ['pago_id', 'type_categoria_id'], buttons: ['judicial', 'judicial-pay', 'judicial-pay-txt']},
    {key: "detallado", value: "detallado", text: "Reporte de Descuentos Detallados", icon: "file text outline", filtros: ['type_detalle_id'], buttons: ['detalle']},
    {key: "aportacion", value: "aportacion", text: "Reporte de Aportaciones", icon: "file text outline", filtros: ['type_aportacion_id'], buttons: ['aportacion']},
    {key: "personal", value: "personal", text: "Reporte de Personal", icon: "file text outline", filtros: ['negativo', 'cargo_id', 'type_categoria_id', 'meta_id'], buttons: ['personal', 'personal-csv']},
    {key: "ejecucion", value: "ejecucion", text: "Reporte de Ejecucion de Planilla", icon: "file text outline", filtros: ['neto'], buttons: ['ejecucion', 'ejecucion-pay', 'ejecucion-total']},
    {key: "compromiso", value: "compromiso", text: "Reporte Compromiso Siaf", icon: "file text outline", filtros: [], buttons: ['compromiso-siaf']}
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
            let query = await genetateQuery();
            let link = await handleUrl(obj.url, obj.params);
            let form_current = document.createElement('form');
            // add auth
            form_current.appendChild(InputAuth());
            // add credenciales
            InputCredencias().filter(i => form_current.appendChild(i));
            // add EntityId
            form_current.appendChild(InputEntity());
            // add form al body
            document.body.appendChild(form_current);
            let simbol = await /[?]/.test(link)  ? '&' : '?';
            form_current.action = `${api.path}/${link}${simbol}${query}`;
            form_current.method = 'POST';
            form_current.target = '_blank';
            form_current.submit();
            document.body.removeChild(form_current);
            app_context.setCurrentLoading(false);
        } else if (obj.action == 'blob') {
            let params = await genetateQuery(false);
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
