import React, { useContext } from 'react';
import { AppContext } from '../contexts';
import { cn } from '@/lib/utils';

const Logo = ({ size = 'default', showText = true, className }) => {
    // app context
    const { app } = useContext(AppContext);

    const sizes = {
        sm: { img: 'tw-w-6 tw-h-6', text: 'tw-text-sm' },
        default: { img: 'tw-w-7 tw-h-7', text: 'tw-text-base' },
        lg: { img: 'tw-w-9 tw-h-9', text: 'tw-text-lg' },
    };

    const currentSize = sizes[size] || sizes.default;

    // render
    return (
        <div className={cn("tw-flex tw-items-center tw-gap-2", className)}>
            <img
                src={app?.icon_images?.icon_50x50 || '/img/base.png'}
                alt={app?.name || 'Logo'}
                className={cn(
                    currentSize.img,
                    "tw-rounded-md tw-object-contain tw-flex-shrink-0"
                )}
            />
            {showText && (
                <span className={cn(
                    currentSize.text,
                    "tw-font-semibold tw-text-white tw-whitespace-nowrap"
                )}>
                    {app?.name || "Integración"}
                </span>
            )}
        </div>
    );
}

export default Logo;
