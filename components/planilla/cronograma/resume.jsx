import React from 'react';
import { useState } from 'react';
import { format } from 'currency-formatter';
import { Button } from 'semantic-ui-react';
import Skeleton from 'react-loading-skeleton';
import Show from '../../show';
import { microPlanilla } from '../../../services/apis';
import { useEffect } from 'react';

const PlaceHolderButton = ({ count = 1 }) => <Skeleton height="38px" count={count}/>

const Resume = ({ id, refresh = true, loading = false, onReady = null }) => {
  
  const [data, setData] = useState({});
  const [currentLoading, setCurrentLoading] = useState(false);

  const findResume = async () => {
    setCurrentLoading(true);
    await microPlanilla.get(`historials/${id}/resume`)
      .then(res => setData(res.data))
      .catch(() => setData({}))
    setCurrentLoading(false);
    if (typeof onReady == 'function') onReady();
  }

  useEffect(() => {
    if (refresh && id) findResume();
  }, [refresh, id]);

  return (
    <div className="row justify-content-center">
      <b className="col-md-3 col-6 mb-1">
        <Show condicion={!loading && !currentLoading}
          predeterminado={<PlaceHolderButton/>}
        >
          <Button basic fluid color="black">
            Total Bruto: {format(data?.totalRemuneration || 0, { code: 'PEN' })}
          </Button>
        </Show>
      </b>

      <b className="col-md-3 col-6 mb-1">
        <Show condicion={!loading && !currentLoading}
          predeterminado={<PlaceHolderButton/>}
        >
          <Button basic fluid color="black">
            Total Dscto: {format(data?.totalDiscount || 0, { code: 'PEN' })}
          </Button>
        </Show>
      </b>

      <b className="col-md-3 col-6 mb-1">
        <Show condicion={!loading && !currentLoading}
          predeterminado={<PlaceHolderButton/>}
        >
          <Button basic fluid color="black">
            Base Imp: {format(data?.totalBase || 0, { code: 'PEN' })}
          </Button>
        </Show>
      </b>
      
      <b className="col-md-3 col-6 mb-1">
        <Show condicion={!loading && !currentLoading}
          predeterminado={<PlaceHolderButton/>}
        >
          <Button basic fluid color="black">
            Total Neto: {format(data?.totalNeto || 0, { code: 'PEN' })}
          </Button>
        </Show>
      </b>
    </div>
  )
}

export default Resume;