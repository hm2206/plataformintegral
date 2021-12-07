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

    const reportCurrentPdf = useRequestBlob({ request: reportProvider.vacations, name: "report-vacations.pdf", extname: "pdf" });
    const reportCurrentExcel = useRequestBlob({ request: reportProvider.vacations, name: "report-vacations.xlsx", extname: "xlsx" });

    const handleInput = ({ name, value }) => {
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const isDisabled = useMemo(() => {
        return (
            reportBasicPdf.loading || 
            reportBasicExcel.loading ||
            reportCurrentPdf.loading ||
            reportCurrentExcel.loading
        )
    }, [
        reportBasicPdf.loading, 
        reportBasicExcel.loading,
        reportCurrentPdf.loading,
        reportCurrentExcel.loading,
    ]);

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

    const handleCurrentPdf = () => {
        setBlock(true);
        reportCurrentPdf.setQuery({ ...form, type: 'pdf' })
        reportCurrentPdf.setExecute(true);
    }

    const handleCurrentExcel = () => {
        setBlock(true);
        reportCurrentExcel.setQuery({ ...form, type: 'excel' })
        reportCurrentExcel.setExecute(true);
    }

    // report basic
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

    
    // report current
    useEffect(() => {
        if (reportCurrentPdf?.file?.name) setFile(reportCurrentPdf?.file)
    }, [reportCurrentPdf.file]);
    
    useEffect(() => {
        if (reportCurrentExcel?.file?.name) setFile(reportCurrentExcel?.file)
    }, [reportCurrentExcel.file]);

    useEffect(() => {
        if (reportCurrentPdf?.isError) setBlock(false)
    }, [reportCurrentPdf.isError]);

    useEffect(() => {
        if (reportCurrentExcel?.isError) setBlock(false)
    }, [reportCurrentExcel.isError]);

    return (
        <>
            <div className='form-group'>
                <Checkbox toggle
                    checked={isActual}
                    onChange={() => setIsActual(prev => !prev)}
                    label='Vacaciones Actuales'
                />
            </div>
            
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
            <Show condicion={!isActual}
                predeterminado={
                    <OptionButton
                        disabled={isDisabled}
                        loadingPdf={reportBasicPdf.loading}
                        loadingExcel={reportBasicExcel.loading}
                        onClickPdf={handleCurrentPdf}
                        onClickExcel={handleCurrentExcel}
                    />
                }
            >
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