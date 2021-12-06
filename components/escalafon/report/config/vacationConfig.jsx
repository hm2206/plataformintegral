import React, { useState, useMemo, useEffect } from 'react';
import { SelectCargo, SelectTypeCategoria } from '../../../select/cronograma'
import { Input, Button, Checkbox } from 'semantic-ui-react'
import ReportProvider from '../../../../providers/escalafon/ReportProvider'
import useRequestBlob from '../../../../hooks/useRequestBlob'
import Show from '../../../show';
import moment from 'moment';

const reportProvider = new ReportProvider();

const OptionButton = ({ 
    onClickPdf = null, 
    onClickExcel = null, 
    disabled = false, 
    loadingPdf = false,
    loadingExcel = false 
}) => {
    return (
        <div className="for-group text-right">
            <hr />
            <Button.Group size="medium">
                <Button color="green" 
                    basic
                    onClick={onClickExcel}
                    disabled={disabled}
                    loading={loadingExcel}
                >
                    <i className="fas fa-file-excel"></i> Excel
                </Button>
                <Button color="red"
                    onClick={onClickPdf}
                    disabled={disabled}
                    loading={loadingPdf}
                >
                    <i className="fas fa-file-pdf"></i> PDF
                </Button>
            </Button.Group>
        </div>
    )
}

const VacationConfig = ({ setFile = null, setBlock = null }) => {

    const [form, setForm] = useState({});
    const [isActual, setIsActual] = useState(false);

    const reportBasicPdf = useRequestBlob({ request: reportProvider.vacationBasics, name: "report-vacations-basic.pdf", extname: "pdf" });
    const reportBasicExcel = useRequestBlob({ request: reportProvider.vacationBasics, name: "report-vacations-basic.xlsx", extname: "xlsx" });

    const handleInput = ({ name, value }) => {
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const isDisabled = useMemo(() => {
        return reportBasicPdf.loading || reportBasicExcel.loading;
    }, [reportBasicPdf.loading, reportBasicExcel.loading]);

    const handlePdf = () => {
        setBlock(true);
        reportBasicPdf.setQuery({ ...form, type: 'pdf' })
        reportBasicPdf.setExecute(true);
    }

    const handleExcel = () => {
        setBlock(true);
        reportBasicExcel.setQuery({ ...form, type: 'excel' })
        reportBasicExcel.setExecute(true);
    }

    useEffect(() => {
        let currentDate = moment();
        setForm({ 
            year: currentDate.year(),
            month: currentDate.month() + 1
        })
    }, [])

    useEffect(() => {
        if (reportBasicPdf?.file?.name) setFile(reportBasicPdf?.file)
    }, [reportBasicPdf.file]);

    useEffect(() => {
        if (reportBasicExcel?.file?.name) setFile(reportBasicExcel?.file)
    }, [reportBasicExcel.file]);

    useEffect(() => {
        if (reportBasicPdf?.isError) setBlock(false)
    }, [reportBasicPdf.isError]);

    useEffect(() => {
        if (reportBasicExcel?.isError) setBlock(false)
    }, [reportBasicExcel.isError]);

    return (
        <>
            <div className='form-group'>
                <Checkbox toggle
                    checked={isActual}
                    onChange={() => setIsActual(prev => !prev)}
                    label='Vacaciones Actuales'
                />
            </div>
            <Show condicion={!isActual}
                predeterminado={
                    <OptionButton
                        disabled={isDisabled}
                        loadingPdf={reportBasicPdf.loading}
                        loadingExcel={reportBasicExcel.loading}
                        onClickPdf={handlePdf}
                        onClickExcel={handleExcel}
                    />
                }
            >
                <div className="form-group">
                    <label>Partición Pre.</label>
                    <SelectCargo
                        disabled={isDisabled}
                        name="cargo_id"
                        value={form?.cargo_id}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>
                <div className="form-group">
                    <label>Tip. Categoría</label>
                    <SelectTypeCategoria
                        disabled={isDisabled}
                        name="type_categoria_id"
                        value={form?.type_categoria_id}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>
                {/* options buttons */}
                <OptionButton
                    disabled={isDisabled}
                    loadingExcel={reportBasicExcel.loading}
                    loadingPdf={reportBasicPdf.loading}
                    onClickPdf={handlePdf}
                    onClickExcel={handleExcel}
                />
            </Show>
        </>
    )
}

export default VacationConfig;