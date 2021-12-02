import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { unujobs } from '../../services/apis';

const SelectCronogramaCreate = ({ onChange = null }) => {

  const defaultData = { value: 'NEW', label: 'Planilla Nueva' };

  const [data, setData] = useState([defaultData]);

  const [loading, setLoading] = useState(false);

  const getData = async (year = '', mes = '', add = false) => {
    setLoading(true);
    await unujobs.get(`cronograma?year=${year}&mes=${mes}`)
    .then(res => {
      const payload = [];
      const cronogramas = [...res.data?.cronogramas?.data];
      if (!add) payload.push(defaultData); 
      cronogramas.forEach(cro => {
        const text = cro.adicional ? `[${cro?.planilla?.nombre} Adicional N° ${cro.adicional}]` : `[${cro?.planilla?.nombre}]`
        payload.push({
          value: cro.id,
          label: `#${cro.id} | ${cro.year}/${cro.mes} ${text}`
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
  }, []);

  return (
    <Select placeholder='Selecionar modo de creación'
      options={data}
      isSearchable
      isClearable
      isLoading={loading}
      onInputChange={handleCronograma}
      onChange={(obj) => typeof onChange == 'function' ? onChange(obj || {}) : null}
    />
  )
}

export default SelectCronogramaCreate;