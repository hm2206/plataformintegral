import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import { microPlanilla } from '../../../services/apis';
import { toast, ToastContainer } from 'react-toastify';

const CalcPim = ({ year, onCalc = null }) => {

  const [currentLoading, setCurrentLoading] = useState(false);

  const calcPimYear = async () => {
    setCurrentLoading(true);
    await microPlanilla.post(`pims/${year}/calcExecuted`)
      .then(() => {
        toast.success(`Los calculos se ejecutarón correctamente!`);
        if (typeof onCalc == 'function') onCalc();
      }).catch(() => {
        toast.error(`No se pudo actualizar los calculos del ${year}`)
    })
    setCurrentLoading(false);
  }

  return (
    <>
      <Button color='black'
        title="Actualizar Calculos"
        onClick={calcPimYear}
        loading={currentLoading}
        disabled={currentLoading}
      >
        <i className="fas fa-sync"></i>
      </Button>
      <ToastContainer/>
    </>
  )
}

export default CalcPim;