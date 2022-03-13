import Modal from "../../modal";
import { Icon, Button } from "semantic-ui-react";
import { SelectListYearToWork } from "../../select/micro-planilla";
import { useState } from "react";
import { microPlanilla } from "../../../services/apis";
import urljoin from "url-join";

export const ReportRenta = ({ isOpen = true, onClose = null, work = {} }) => {

  const [year, setYear] = useState();

  const handleLink = () => {
    const a = document.createElement("a")
    const url = urljoin(microPlanilla.path, `works/${work?.id}/historyResume/${year}`)
    a.href = url;
    a.target = '__blank';
    a.click();
  }

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
          <Button color="red" onClick={handleLink}>
            <i className="far fa-file-pdf"></i> Generar Reporte
          </Button>
        </div>
      </div>
    </Modal>
  )
}