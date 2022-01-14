import React from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { microPlanilla } from '../../../services/apis';
import ListPims from '../../../components/planilla/pims/list-pims';

const PimIndex = ({ pathname, query, pim }) => {

  return (
    <ListPims
      pim={pim}
      pathname={pathname}
      query={query}
    />
  )
}

// server
PimIndex.getInitialProps = async (ctx) => {
  AUTHENTICATE(ctx);
  let { pathname, query } = ctx;
  // filtros
  let fecha = new Date();
  query.page = typeof query.page != 'undefined' ? query.page : 1;
  query.year = typeof query.year != 'undefined' ? query.year : fecha.getFullYear();
  // obtener datos
  let query_string = `page=${query.page}&year=${query.year}&limit=200`;
  let { success, pim } = await microPlanilla.get(`pims?${query_string}`, {}, ctx)
    .then(res => ({ success: true, pim: res.data }))
    .catch(() => ({ success: false, pim: {} }));
  // response
  return { pathname, query, success, pim }; 
}

// exportar
export default PimIndex;