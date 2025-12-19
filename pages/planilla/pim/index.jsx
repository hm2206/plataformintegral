import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { microPlanilla } from '../../../services/apis';
import ListPims from '../../../components/planilla/pims/list-pims';

const PimIndex = () => {
    const router = useRouter();
    const { pathname, query } = router;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [pim, setPim] = useState({});

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await microPlanilla.get(`pims?${query_string}`)
            .then(res => {
                setSuccess(res.data.success);
                setPim(res.data.pim);
            })
            .catch(err => console.error(err));
        setLoading(false);
    };


  return (
    <ListPims
      pim={pim}
      pathname={pathname}
      query={query}
    />
  )
}

// exportar
export default PimIndex;