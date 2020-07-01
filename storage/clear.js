export const clearStorage = async (store) => {
    await store.dispatch({ type: 'LOGOUT' });
    await store.dispatch({ type: 'CLEAR_AFP' });
    await store.dispatch({ type: 'CLEAR_APPS' });
    await store.dispatch({ type: 'CLEAR_CARGO' });
    await store.dispatch({ type: 'CLEAR_CONVOCATORIA' });
    await store.dispatch({ type: 'CLEAR_CRONOGRAMA' });
    await store.dispatch({ type: 'CLEAR_DEPENDENCIAS' });
    await store.dispatch({ type: 'CLEAR_HISTORIAL' });
    await store.dispatch({ type: 'CLEAR_INFO' });
    await store.dispatch({ type: 'CLEAR_META' });
    await store.dispatch({ type: 'CLEAR_PERMISSION' });
    await store.dispatch({ type: 'CLEAR_PERSONAL' });
    await store.dispatch({ type: 'CLEAR_PERSON' });
    await store.dispatch({ type: 'CLEAR_SYSTEM' });
    await store.dispatch({ type: 'CLEAR_TYPE_APORTACION' });
    await store.dispatch({ type: 'CLEAR_TYPE_CATEGORIA' });
    await store.dispatch({ type: 'CLEAR_TYPE_DESCUENTO' });
    await store.dispatch({ type: 'CLEAR_TYPE_DETALLE' });
    await store.dispatch({ type: 'CLEAR_TYPE_REMUNERACION' });
    await store.dispatch({ type: 'CLEAR_TYPE_SINDICATO' });
    await store.dispatch({ type: 'CLEAR_USER' });
    await store.dispatch({ type: 'CLEAR_WORK' });
}