import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { microPlanilla } from '../../../services/apis';

const SelectCronogramaCreate = ({ principal = true, onChange = null, disabled = false, planillaId = null }) => {

  const defaultData = { value: 'NEW', label: 'Planilla Nueva' };

  const [data, setData] = useState([defaultData]);

  const [loading, setLoading] = useState(false);

  const getData = async (year = '', mes = '', add = false) => {
    const queryString = new URLSearchParams();
    if (year) queryString.set('year', year);
    if (mes) queryString.set('month', mes);
    if (planillaId) queryString.set('planillaId', planillaId);
    setLoading(true);
    const url = principal ? 'cronogramas' : 'cronogramas/notPrincipal';
    await microPlanilla.get(`${url}?limit=100&state=false`, { params: queryString })
    .then(res => {
      const payload = [];
      const cronogramas = [...res.data?.items];
      if (!add) payload.push(defaultData); 
      cronogramas.forEach(cro => {
        const text = cro.adicional ? `[${cro?.planilla?.name} Adicional N° ${cro.adicional}]` : `[${cro?.planilla?.name}]`
        payload.push({
          value: cro.id,
          label: `#${cro.id} | ${cro.year}/${cro.month} ${text}`
        })
      });
      setData(prev => add ? [...prev, ...data] : payload);
    }).catch(err => console.log(err));
    setLoading(false);
  }

  const handleCronograma = (query = '') => {
    if (query.length < 4) return;
    const [year, mes] = query.split('/');
    getData(year, mes);
  }

  useEffect(() => {
    getData();
  }, [planillaId]);

  return (
    <Select placeholder='Selecionar modo de creación'
      options={data}
      isSearchable
      isClearable
      isDisabled={disabled}
      isLoading={loading}
      onInputChange={handleCronograma}
      onChange={(obj) => typeof onChange == 'function' ? onChange(obj || {}) : null}
    />
  )
}

export default SelectCronogramaCreate;