import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const useRequestBlob = ({ request }) => {

    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState({});
    const [execute, setExecute] = useState(false)
    const [params, setParams] = useState([]);

    const handleRequestBlob = async () => {
        setLoading(true);
        await request(...params)
        .then(({ data }) => {
            let name = "reporte-general.pdf"
            let file = new File([data], name);
            let url = URL.createObjectURL(data);
            let extname = "pdf";
            let size = file.size
            setFile({ name, url, extname, size })
        }).catch(() =>  Swal.fire("No se pudó generar el reporte"))
        setLoading(false);
    }

    useEffect(() => {
        if (execute) handleRequestBlob();
    }, [execute])

    useEffect(() => {
        if (execute) setExecute(false);
    }, [execute]);

    return { file, loading, setExecute, setParams }
}


export default useRequestBlob;