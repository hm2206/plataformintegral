import React, { createContext, useEffect, useMemo, useState } from 'react';

export const ScreenContext = createContext();

export const ScreenProvider = ({ children = null }) => {

    // estados
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [mode, setMode] = useState();
    const [fullscreen, setFullscreen] = useState(false);
    const [toggle, setToggle] = useState(false);

    // config
    const dimensiones = [
        { min: 0, max: 768, name: "small" },
        { min: 769, max: 992, name: "medium" },
        { min: 992, max: 1200, name: "long" },
        { min: 1201, max: 8000, name: "x-long" }
    ];

    // retornar el mode
    const handleMode = async (width) => {
        await dimensiones.map(d => {
            if (width >= d.min && width <= d.max) setMode(d.name);
        });
    }

    // obtener dimensiones
    const handleScreen = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
        handleMode(window.innerWidth);
    }

    // config width y height
    useEffect(() => {
        if (typeof window == 'object') handleScreen();
    }, []);

    // handle Event Resize
    useEffect(() => {
        if (typeof window == 'object') window.addEventListener('resize', handleScreen);
        return () => {
            if (typeof window == 'object') window.removeEventListener('resize', handleScreen);
        }
    }, []);
    
    // render
    return (
        <ScreenContext.Provider value={{ width, height, mode, fullscreen, setFullscreen, toggle, setToggle }}>
            {children}
        </ScreenContext.Provider>
    );
}