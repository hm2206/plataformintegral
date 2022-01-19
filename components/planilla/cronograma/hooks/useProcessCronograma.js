import { useState } from "react"
import { microPlanilla } from "../../../../services/apis";
import { toast } from 'react-toastify';

const useProcessCronograma = (cronograma = {}) => {

  const [loading, setLoading] = useState(false);

  const processing = () => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      await microPlanilla.post(`cronogramas/${cronograma?.id}/process`)
        .then(res => {
          toast.success("El cronograma se proceso correctamente!", {
            progress: undefined
          });
          resolve(res);
        })
        .catch(err => {
          toast.error("No se pudo procesar el cronograma", {
            progress: undefined
          });
          reject(err);
        })
      setLoading(false);
    })
  }

  return {
    loading,
    processing
  }
}

export default useProcessCronograma;