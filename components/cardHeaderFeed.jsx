import React from 'react';
import Show from './show';

const CardHeaderFeed = ({ title, description, image = "", options = [] }) => {

    // render
    return (
        <header class="page-title-bar">
            {/* <!-- grid row --> */}
            <div class="row text-center text-sm-left">
                {/* <!-- grid column --> */}
                <div class="col-sm-auto col-12 mb-2 ml-1">
                    {/* <!-- .has-badge --> */}
                    <Show condicion={image}>
                        <div class="has-badge has-badge-bottom">
                            <a href="#" class="ml-3 user-avatar user-avatar-xl">
                                <img src={image}/>
                            </a>
                            <span class="tile tile-circle tile-xs"
                                data-toggle="tooltip" 
                                title="" 
                                data-original-title="Public"
                            >
                                <i class="fas fa-bell"></i>
                            </span>
                        </div>
                    </Show>
                </div>
                {/* <!-- grid column --> */}
                <div class="col">
                    <h1 class="page-title"> {title} </h1>
                    <p class="text-muted"> {description} </p>
                </div>
            </div>
            {/* <!-- .nav-scroller --> */}
            <Show condicion={options?.length}
                predeterminado={<hr/>}
            >
                <div class="nav-scroller border-bottom">
                    {/* <!-- .nav --> */}
                    <div class="nav nav-tabs">
                        {options.map((o, indexO) => {
                            <a class="nav-link" key={`list-datos-${indexO}`}>
                                {o.text || ""}
                            </a> 
                        })}
                    </div>
                </div>
            </Show>
        </header>
    )
}

export default CardHeaderFeed;