import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

const Pagination = ({
    activePage = 1,
    totalPages = 1,
    onPageChange,
    className,
    showPageNumbers = true,
    maxVisiblePages = 5,
}) => {
    const currentPage = parseInt(activePage) || 1;
    const total = parseInt(totalPages) || 1;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= total && typeof onPageChange === "function") {
            onPageChange(null, { activePage: page });
        }
    };

    // Generar números de página visibles
    const getVisiblePages = () => {
        const pages = [];
        let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let end = Math.min(total, start + maxVisiblePages - 1);

        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    if (total <= 1) return null;

    return (
        <div className={cn("tw-flex tw-justify-center tw-items-center tw-gap-1", className)}>
            {/* Primera página */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage <= 1}
                className="tw-hidden sm:tw-inline-flex"
            >
                <i className="fas fa-angle-double-left"></i>
            </Button>

            {/* Página anterior */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <i className="fas fa-chevron-left"></i>
            </Button>

            {/* Números de página */}
            {showPageNumbers && (
                <div className="tw-hidden sm:tw-flex tw-gap-1">
                    {getVisiblePages().map((page) => (
                        <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="tw-min-w-[36px]"
                        >
                            {page}
                        </Button>
                    ))}
                </div>
            )}

            {/* Indicador móvil */}
            <span className="tw-px-3 tw-py-1 tw-text-sm tw-text-gray-600 sm:tw-hidden">
                {currentPage} / {total}
            </span>

            {/* Página siguiente */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= total}
            >
                <i className="fas fa-chevron-right"></i>
            </Button>

            {/* Última página */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(total)}
                disabled={currentPage >= total}
                className="tw-hidden sm:tw-inline-flex"
            >
                <i className="fas fa-angle-double-right"></i>
            </Button>
        </div>
    );
};

export { Pagination };
