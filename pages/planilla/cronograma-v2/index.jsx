import React, { useContext, useEffect } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { microPlanilla } from '../../../services/apis';
import ListCronograma from '../../../components/planilla/cronograma/listCronograma'
import { EntityContext } from '../../../contexts/EntityContext';

const CronogramaIndex = ({ pathname, query, cronogramas }) => {

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

// server
CronogramaIndex.getInitialProps = async (ctx) => {
  AUTHENTICATE(ctx);
  let { pathname, query } = ctx;
  // filtros
  let fecha = new Date();
  query.page = typeof query.page != 'undefined' ? query.page : 1;
  query.year = typeof query.year != 'undefined' ? query.year : fecha.getFullYear();
  query.mes = typeof query.mes != 'undefined' ? query.mes : fecha.getMonth() + 1;
  // obtener datos
  let query_string = `page=${query.page}&year=${query.year}&month=${query.mes}`;
  let { success, cronogramas } = await microPlanilla.get(`cronogramas?${query_string}`, {}, ctx)
      .then(res => ({ success: true, cronogramas: res.data }))
      .catch(() => ({ success: false, cronogramas: {} }));
  // response
  return { pathname, query, success, cronogramas }; 
}

// exportar
export default CronogramaIndex;