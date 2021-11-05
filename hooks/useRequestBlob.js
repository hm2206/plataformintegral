import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const useRequestBlob = ({ name, extname, request, params = [] }) => {

    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState({});
    const [execute, setExecute] = useState(false)
    const [query, setQuery] = useState({});
    const [isError, setIsError] = useState(false);

    let requestArgs = params.length ? [...params, query] : [query];

    const handleRequestBlob = async () => {
        setLoading(true);
        await request(...requestArgs)
        .then(({ data }) => {
            let file = new File([data], name);
            let url = URL.createObjectURL(data);
            let size = file.size
            setFile({ name, url, extname, size })
            setIsError(false);
        }).catch(() =>  {
            setIsError(true)
            Swal.fire({ icon: 'warning', text: "No se pudó generar el reporte" })
        })
        setLoading(false);
    }

    useEffect(() => {
        if (execute) handleRequestBlob();
    }, [execute])

    useEffect(() => {
        if (execute) setExecute(false);
    }, [execute]);

    return { file, loading, setExecute, setQuery, isError }
}


export default useRequestBlob;