import React, { Component } from "react";

const schemaNav = {
    key: "", text: "", index: 0
};

const PageNav = ({ options = [schemaNav], tab = "", onOption = null }) => {

    // render
    return (
        <nav className="page-navs">
            <div className="nav-scroller">
                <div className="nav nav-tabs">
                    {options.map((obj, indexO) => (
                        <a className={`nav-link cursor-pointer ${tab == obj.key ? "active" : ""}`}
                            key={`notification-link-${obj.key}-${indexO}`}
                            onClick={(e) => {
                                e.preventDefault();
                                typeof onOption == 'function' ? onOption(e, indexO, obj) : null
                            }}
                        >
                            {obj.text}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
}

export default PageNav;