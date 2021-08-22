import { createContext, useState, useMemo, useReducer, useEffect } from 'react'
import moment from 'moment';
import { DiscountReducer, discountTypes, initialStates } from './DiscountReducer'
import ConfigDiscountProvider from '../../providers/escalafon/ConfigDiscountProvider'

const configDiscountProvider = new ConfigDiscountProvider();

export const DiscountContext = createContext(initialStates);

export const DiscountProvider = ({ children = null }) => {

    //  estados
    const [current_loading, setCurrentLoading] = useState(false)
    const [is_refresh, setIsRefresh] = useState(false);
    const [is_error, setIsError] = useState(false);

    // reducer
    const [state, dispatch] = useReducer(DiscountReducer, initialStates)

    // memos
    const dateIsValid = useMemo(() => {
        let formatDate = `${state.config_discount?.year}-${state.config_discount?.month}`;
        let validate = moment(formatDate, 'YYYY-MM').isValid();
        return validate ? true : false;
    }, [state?.config_discount?.id]);

    const countDays = useMemo(() => {
        let formatDate = `${state.config_discount?.year}-${state.config_discount?.month}`;
        let daysInMonth = moment(formatDate, 'YYYY-MM').daysInMonth();
        return daysInMonth || 0;
    }, [state?.config_discount?.id]);

    const countColumns = useMemo(() => {
        return countDays + 8;
    }, [countDays]);

    const isNextPage = useMemo(() => {
        return (state.page + 1) <= state.last_page;
    }, [state.data]);

    const defaultRefresh = () => {
        dispatch({ type: discountTypes.SET_PAGE, payload: 1 });
        dispatch({ type: discountTypes.SET_DATA, payload: [] });
        setIsRefresh(true)
    }

    const getDiscounts = async (add = false) => {
        setCurrentLoading(true);
        let queryParams = {
            page: state.page, 
            type_categoria_id: state.type_categoria_id,
            cargo_id: state.cargo_id
        }
        // request
        await configDiscountProvider.discounts(state?.config_discount?.id, queryParams)
        .then(res => {
            let { discounts } = res.data;
            setIsError(false);
            dispatch({ type: discountTypes.SET_PAGE, payload:  discounts.page })
            dispatch({ type: discountTypes.SET_LAST_PAGE, payload:  discounts.lastPage || 0 })
            dispatch({ type: discountTypes.SET_TOTAL, payload: discounts.total || 0 })
            dispatch({ type: add ? discountTypes.ADD_DATA : discountTypes.SET_DATA, payload: discounts.data })
        }).catch(() => setIsError(true));
        setCurrentLoading(false);
    }

    useEffect(() => {
        dispatch({ type: discountTypes.SET_CONFIG_DISCOUNT, payload: {} });
    }, [state?.year]);

    useEffect(() => {
        if (dateIsValid) defaultRefresh();
    }, [state?.config_discount?.id, state?.cargo_id, state?.type_categoria_id]);

    useEffect(() => {
        if (state.page > 1) getDiscounts(true)
    }, [state.page])

    useEffect(() => {
        if (is_refresh) getDiscounts();
    }, [is_refresh])

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh])

    return (
        <DiscountContext.Provider value={{ current_loading, is_refresh, is_error, dispatch, ...state, countColumns, isNextPage, defaultRefresh }}>
            {children}
        </DiscountContext.Provider>
    )
}