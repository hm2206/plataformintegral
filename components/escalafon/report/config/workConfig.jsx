import React, { useState, useMemo, useEffect } from 'react';
import { SelectCargo, SelectTypeCategoria } from '../../../select/cronograma'
import { Input, Button } from 'semantic-ui-react'
import ReportProvider from '../../../../providers/escalafon/ReportProvider'
import useRequestBlob from '../../../../hooks/useRequestBlob'

const reportProvider = new ReportProvider();

const WorkConfig = ({ setFile = null, setBlock = null }) => {

    const [form, setForm] = useState({});

    const reportPdf = useRequestBlob({ request: reportProvider.general, name: "report-general.pdf", extname: "pdf" });
    const reportExcel = useRequestBlob({ request: reportProvider.general, name: "report-general.xlsx", extname: "xlsx" });

    const handleInput = ({ name, value }) => {
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const isDisabled = useMemo(() => {
        return reportPdf.loading || reportExcel.loading;
    }, [reportPdf.loading, reportExcel.loading]);

    const handlePdf = () => {
        setBlock(true);
        reportPdf.setQuery({ ...form, type: 'pdf' })
        reportPdf.setExecute(true);
    }

    const handleExcel = () => {
        setBlock(true);
        reportExcel.setQuery({ ...form, type: 'excel' })
        reportExcel.setExecute(true);
    }

    useEffect(() => {
        if (reportPdf?.file?.name) setFile(reportPdf?.file)
    }, [reportPdf.file]);

    useEffect(() => {
        if (reportExcel?.file?.name) setFile(reportExcel?.file)
    }, [reportExcel.file]);

    useEffect(() => {
        if (reportPdf?.isError) setBlock(false)
    }, [reportPdf.isError]);

    useEffect(() => {
        if (reportExcel?.isError) setBlock(false)
    }, [reportExcel.isError]);

    return (
        <>
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

            <div className="for-group text-right">
                <hr />
                <Button.Group size="medium">
                    <Button color="green" 
                        basic
                        onClick={handleExcel}
                        disabled={isDisabled}
                        loading={reportExcel.loading}
                    >
                        <i className="fas fa-file-excel"></i> Excel
                    </Button>
                    <Button color="red"
                        onClick={handlePdf}
                        disabled={isDisabled}
                        loading={reportPdf.loading}
                    >
                        <i className="fas fa-file-pdf"></i> PDF
                    </Button>
                </Button.Group>
            </div>
        </>
    )
}

export default WorkConfig;