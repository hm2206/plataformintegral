import Modal from "../../modal";
import { Icon, Button } from "semantic-ui-react";
import { SelectListYearToWork } from "../../select/micro-planilla";
import { useState } from "react";

export const ReportRenta = ({ isOpen = true, onClose = null, work = {} }) => {

  const [year, setYear] = useState();

  return (
    <Modal show={isOpen} 
      isClose={onClose}
      titulo={<span><Icon name="cart arrow down"/> Renta Anual</span>}
      height="30%"
    >
      <div className="card-body">
        <SelectListYearToWork
          workId={work?.id}
          value={year}
          onChange={(e, obj) => setYear(obj.value)}
        />
        <div className="mt-3 text-right">
          <Button color="red">
            <i className="far fa-file-pdf"></i> Generar Reporte
          </Button>
        </div>
      </div>
    </Modal>
  )
}