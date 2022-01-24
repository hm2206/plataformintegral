import { useState } from "react"
import { microPlanilla } from "../../../../services/apis";
import { toast } from 'react-toastify';

const useProcessCronograma = (cronograma = {}) => {

  const [loading, setLoading] = useState(false);

  const processing = () => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      toast.dismiss();
      toast.info("Procesando cronograma...");
      await microPlanilla.post(`cronogramas/${cronograma?.id}/process`)
        .then(res => {
          toast.dismiss();
          toast.success("El cronograma se proceso correctamente!", {
            hideProgressBar: true
          });
          resolve(res);
        })
        .catch(err => {
          toast.error("No se pudo procesar el cronograma", {
            hideProgressBar: true
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