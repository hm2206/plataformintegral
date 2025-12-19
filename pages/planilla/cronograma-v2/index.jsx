import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { microPlanilla } from '../../../services/apis';
import ListCronograma from '../../../components/planilla/cronograma/listCronograma'
import { EntityContext } from '../../../contexts/EntityContext';

const CronogramaIndex = () => {
    const router = useRouter();
    const { pathname, query } = router;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [cronogramas, setCronogramas] = useState({});

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await microPlanilla.get(`cronogramas?${query_string}`)
            .then(res => {
                setSuccess(res.data.success);
                setCronogramas(res.data.cronogramas);
            })
            .catch(err => console.error(err));
        setLoading(false);
    };


  const entity_context = useContext(EntityContext);

  useEffect(() => {
    entity_context.fireEntity({ render: true });
    return () => entity_context.fireEntity({ render: false });
  }, []);

  return (
    <ListCronograma cronogramas={cronogramas}
      pathname={pathname}
      query={query}
      principal={true}
    />
  )
}

// exportar
export default CronogramaIndex;