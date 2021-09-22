import React, { useState, useMemo, useEffect } from 'react';
import { SelectCargo, SelectTypeCategoria } from '../../../select/cronograma'
import { Input, Button } from 'semantic-ui-react'
import ReportProvider from '../../../../providers/escalafon/ReportProvider'
import useRequestBlob from '../../../../hooks/useRequestBlob'

const reportProvider = new ReportProvider();

const WorkConfig = ({ setFile = null, setBlock = null }) => {

    const [form, setForm] = useState({});

    const reportPdf = useRequestBlob({ request: reportProvider.general });
    const reportExcel = useRequestBlob({ request: reportProvider.general });

    const handleInput = ({ name, value }) => {
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const isDisabled = useMemo(() => {
        return reportPdf.loading || reportExcel.loading;
    }, [reportPdf.loading, reportExcel.loading]);

    useEffect(() => {
        if (reportPdf?.file?.name) setFile(reportPdf?.file)
    }, [reportPdf.file]);

    useEffect(() => {
        reportPdf.setParams([form]);
        reportExcel.setParams([form]);
    }, [form]);

    return (
        <>
            <div className="form-group">
                <label>Buscar por: Apellidos y Nombres</label>
                <Input fluid
                    disabled={isDisabled}
                    name="query_search"
                    placeholder="Buscar..."
                    value={form?.query_search || null}
                    onChange={({ target }) => handleInput(target)}
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

            <div className="for-group text-right">
                <hr />
                <Button.Group size="medium">
                    <Button color="green" 
                        basic
                        disabled={isDisabled}
                        loading={reportExcel.loading}
                    >
                        <i className="fas fa-file-excel"></i> Excel
                    </Button>
                    <Button color="red"
                        onClick={() => {
                            setBlock(true);
                            reportPdf.setExecute(true);
                        }}
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