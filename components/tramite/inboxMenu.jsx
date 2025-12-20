import React, { useEffect, useContext } from 'react';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const InboxMenu = ({ dependencia_id = null }) => {
    const { status, menu, dispatch, setPage, setIsSearch, current_loading } = useContext(TramiteContext);

    const handleMenu = (newMenu) => {
        if (current_loading) return;
        setPage(1);
        setIsSearch(true);
        dispatch({ type: tramiteTypes.CHANGE_MENU, payload: newMenu });
        dispatch({ type: tramiteTypes.CHANGE_RENDER, payload: "TAB" });
    }

    useEffect(() => {
        dispatch({ type: tramiteTypes.CHANGE_MENU, payload: "INBOX" });
    }, []);

    return (
        <div className="tw-w-52 tw-flex-shrink-0 tw-bg-gray-50 tw-border-r tw-border-gray-200 tw-py-2 tw-overflow-y-auto">
            <nav className="tw-px-2 tw-space-y-0.5">
                {status.map((state, indexS) => {
                    const isActive = state.key === menu;
                    const count = state.count || 0;
                    return (
                        <button
                            key={`menu-item-${indexS}-${state.key}`}
                            onClick={() => handleMenu(state.key)}
                            disabled={current_loading}
                            className={cn(
                                "tw-w-full tw-flex tw-items-center tw-gap-3 tw-px-3 tw-py-2 tw-rounded-lg tw-text-left tw-border-0 tw-cursor-pointer tw-transition-all tw-duration-150",
                                isActive
                                    ? "tw-bg-primary-100 tw-text-primary-700 tw-font-medium"
                                    : "tw-bg-transparent tw-text-gray-700 hover:tw-bg-gray-100",
                                current_loading && "tw-opacity-50 tw-cursor-not-allowed"
                            )}
                        >
                            <i className={cn(
                                state.icon,
                                "tw-w-4 tw-text-center tw-text-sm",
                                isActive ? "tw-text-primary-600" : "tw-text-gray-500"
                            )}></i>
                            <span className="tw-flex-1 tw-text-sm tw-truncate">
                                {state.text}
                            </span>
                            <Badge
                                variant={isActive ? "default" : "secondary"}
                                className={cn(
                                    "tw-text-[10px] tw-px-1.5 tw-py-0 tw-h-5 tw-min-w-[20px] tw-justify-center",
                                    isActive && "tw-bg-primary-600",
                                    count === 0 && "tw-bg-gray-200 tw-text-gray-500"
                                )}
                            >
                                {count > 99 ? '99+' : count}
                            </Badge>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

export default InboxMenu;
