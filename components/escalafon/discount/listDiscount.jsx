import React, { useContext, useState, useEffect, useMemo } from "react";
import moment from "moment";
import Show from '../../show'
import Skeleton from 'react-loading-skeleton';
import TableContentDiscount from "./tableContentDiscount";
import { DiscountContext } from "../../../contexts/escalafon/DiscountContext";
import { discountTypes } from "../../../contexts/escalafon/DiscountReducer";
import ItemDiscount from './itemDiscount'
import { Button } from 'semantic-ui-react'

const PlaceholderTable = ({ column = 1 }) => {

    const arrayColumns = useMemo(() => {
        let columns = [];
        for(let index = 0; index < column; index++) {
            columns.push(index + 1);
        }

        return columns;
    }, [column]);

    const datos = [1, 2, 3, 4, 5, 6, 7, 8];

    return datos.map(d => 
        <tr key={`iter-table-${d}`}>
            {arrayColumns.map(col =>
                <td key={`item-table-${d}-column-${col}`}><Skeleton/></td>
            )}
        </tr>
    )
}

const MonthHeaders = ({ year, month }) => {
    
    const [months, setMonths] = useState([]);

    const generateMonths = () => {
        let date = `${year}-${month}-01`;
        let lastMonth = moment(date, 'YYYY-MM-DD').add(1, 'months').subtract(1, 'days').format('D');
        let indexDays = {
            0: "D",
            1: "L",
            2: "M",
            3: "M",
            4: "J",
            5: "V",
            6: "S"
        }
        let payload = [];
        for (let index = 1; index <= lastMonth; index++) {
            let current_date = moment(`${year}-${month}-${index}`);
            payload.push({
                text: current_date.format('D'),
                index: indexDays[current_date.days()] || ""
            });
        }
        setMonths(payload);
    }

    useEffect(() => {
        if (year && month) generateMonths()
    }, [year, month]);

    return months.map((m, indexM) => 
        <th className="text-center no-wrap" key={`item-header-${indexM}`}>
            <div>{m.text}</div>
            <div style={{ borderTop: "1px solid #000" }}>{m.index}</div>
        </th>
    );
}

const ListDiscount = () => {

    const state = useContext(DiscountContext);
    const { dispatch } = state

    const handleNextPage = () => {
        dispatch({ type: discountTypes.ADD_PAGE })
    }

    return (
        <div className="card-body h-100">
            <div className="table-responsive" style={{ minHeight: "50vh" }}>
                <table className="table-excel font-10">
                    <thead>
                        <tr>
                            <th className="text-center" witdh="30px">N° <br/> TRAB</th>
                            <th className="text-center no-wrap" witdh="300px">APELLIDOS  Y  NOMBRES</th>
                            <th className="text-center no-wrap" witdh="300px">N° DOCUMENTO</th>
                            <th className="text-center no-wrap" width="50px">CAT. NIV.</th>
                            <MonthHeaders year={state?.config_discount?.year || 0} month={state?.config_discount?.month || 0}/>
                            <th className="text-center no-wrap">TOT <br /> MIN</th>
                            <th className="text-center no-wrap">(*) <br /> TOTAL <br /> DESC.</th>
                            <th className="text-center no-wrap">DCTO <br /> X <br /> MIN</th>
                            <th className="text-center no-wrap">BASE DE <br /> CALCULO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* listar datos */}
                        {state?.data?.map((d, indexD) => 
                            <ItemDiscount key={`list-discount-${indexD}`}
                                index={indexD}
                                info={d}
                            />  
                        )}
                        {/* no hay registros */}
                        <Show condicion={!state?.current_loading && !state?.data?.length}>
                            <tr>
                                <th colSpan={state?.countColumns} className="text-center font-14">
                                    No hay regístros disponibles
                                </th>
                            </tr>
                        </Show>
                        {/* cargar datos */}
                        <Show condicion={state?.current_loading}>
                            <PlaceholderTable column={state?.countColumns}/>
                        </Show>
                        {/* paginados */}
                        <Show condicion={!state?.current_loading && state?.isNextPage}> 
                            <tr>
                                <th className="font-12" colSpan={state?.countColumns}>
                                    <Button fluid 
                                        basic
                                        color="black"
                                        onClick={handleNextPage}
                                    >
                                        <i className="fas fa-arrow-down"></i> Obtener más regístros
                                    </Button>
                                </th>
                            </tr>
                        </Show>
                    </tbody>
                </table>
                {/* info */}
                <div className="row">
                    <div className="col-5">
                        <TableContentDiscount/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListDiscount;