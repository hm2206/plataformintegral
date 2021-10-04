import { useEffect, useMemo, useState } from 'react';
import urlJoin from 'url-join'
import uid from 'uid'

const usePaginate = ({ api = {}, url = "", queryString = "", config = {}, execute = true }, callback = null) => {

    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1);
    const [query_search, setQuerySearch] = useState("");
    const [lastPage, setLastPage] = useState(1)
    const [total, setTotal] = useState(0);
    const [isRefresh, setIsRefresh] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isFeching, setIsFeching] = useState();

    const newUrl = urlJoin(url, `?page=${page}&query_search=${query_search}&${queryString}`)

    const getData = async (add = false) => {
        setLoading(true)
        await api.get(newUrl, config)
        .then(({ data }) => {
            setLastPage(data.last_page);
            setTotal(data.total);
            setIsError(false)
            if (typeof callback == 'function') callback(data.data, add)
        }).catch(() => setIsError(true))
        setLoading(false)
        setIsFeching(uid(8));
    }

    const canNext = useMemo(() => {
        return (page + 1) <= lastPage;
    }, [isFeching]);

    useEffect(() => {
        if (isRefresh && page == 1) getData();
        else if (isRefresh && page > 1) setPage(1);
    }, [isRefresh])

    useEffect(() => {
        if (page == 1 && execute) getData(); 
    }, [page])

    useEffect(() => {
        if (page > 1) getData(true);
    }, [page])

    useEffect(() => {
        if (isRefresh) setIsRefresh(false);
    }, [isRefresh])

    // response
    return { loading, setQuerySearch, query_search, page, lastPage, total, isError, isRefresh, setIsRefresh, canNext }
}

export default usePaginate;