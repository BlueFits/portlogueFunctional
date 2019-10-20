
/* Needed outside document ready */

/*  Hover System */
    
function closeHover() {
    $(".web-popup").css("z-index", "-1");
    $("body").css("overflow", "auto");
    $("#web-frame").attr("src", ``);
}

//Location Params Code
location.params = function(params) {
    var obj = {}, i, parts, len, key, value;

    if (typeof params === 'string') {
        value = location.search.match(new RegExp('[?&]' + params + '=?([^&]*)[&#$]?'));
        return value ? value[1] : undefined;
    }

    var _params = location.search.substr(1).split('&');

    for (i = 0, len = _params.length; i < len; i++) {
        parts = _params[i].split('=');
        if (! parts[0]) {continue;}
        obj[parts[0]] = parts[1] || true;
    }

    if (typeof params !== 'object') {return obj;}

    for (key in params) {
        value = params[key];
        if (typeof value === 'undefined') {
        delete obj[key];
        } else {
        obj[key] = value;
        }
    }

    parts = [];
    for (key in obj) {
        parts.push(key + (obj[key] === true ? '' : '=' + obj[key]));
    }

    location.search = parts.join('&');
};


/*  */

$( document ).ready(()=> {

    $(`.profile-icon-wrapper`).on(`click`,()=> {
        $(`.home-nav-dropdown`).toggle();
    
        if ($(`.add-friend-dropdown`).css(`display`) === `block` ||  $(`.home-quick-dropdown`).css(`display`) === `block` || ($("#filterIcon > img").attr("src") === "/assets/icons/icons8-filter-96-hover.png") && (filterCounter === 1)) {
            $(`.hidden-overlay`).css(`display`, `block`);       
        }
    
        else {
            $(`.hidden-overlay`).toggle();
        }
    
        $(`.add-friend-dropdown`).css(`display`,`none`);
        $(`.home-quick-dropdown`).css(`display`, `none`);
        /* filter icon */
        $("#filterIcon > img").attr("src", "/assets/icons/icons8-filter-96.png");
        $(".filterLabel").css("background-color", "transparent");
        $(".filterLabel > span").css("color", "#bbbbbb");
        $(".filter-dropdown").css("display","none");
    });
    
    $(`#qs-dropdown`).on(`click`, ()=> {
        $(`.home-quick-dropdown`).toggle();
    
        if ($(`.add-friend-dropdown`).css(`display`) === `block` || $(`.home-nav-dropdown`).css(`display`) === `block` || ($("#filterIcon > img").attr("src") === "/assets/icons/icons8-filter-96-hover.png") && (filterCounter === 1)) {
            $(`.hidden-overlay`).css(`display`, `block`);       
        }
    
        else {
            $(`.hidden-overlay`).toggle();
        }
        
        $(`.add-friend-dropdown`).css(`display`,`none`);
        $(`.home-nav-dropdown`).css(`display`, `none`);  
        /* filter icon */
        $("#filterIcon > img").attr("src", "/assets/icons/icons8-filter-96.png");
        $(".filterLabel").css("background-color", "transparent");
        $(".filterLabel > span").css("color", "#bbbbbb");
        $(".filter-dropdown").css("display","none");
    });
    
    $(`#friend-drop`).on(`click`, ()=> {
        $(`.add-friend-dropdown`).toggle();
    
        if ($(`.home-nav-dropdown`).css(`display`) === `block` ||  $(`.home-quick-dropdown`).css(`display`) === `block` || ($("#filterIcon > img").attr("src") === "/assets/icons/icons8-filter-96-hover.png") && (filterCounter === 1)) {
            $(`.hidden-overlay`).css(`display`, `block`);
        }
    
        else {
            $(`.hidden-overlay`).toggle();
        }
    
        $(`.home-nav-dropdown`).css(`display`, `none`);
        $(`.home-quick-dropdown`).css(`display`, `none`); 
        /* filter icon */
        $("#filterIcon > img").attr("src", "/assets/icons/icons8-filter-96.png");
        $(".filterLabel").css("background-color", "transparent");
        $(".filterLabel > span").css("color", "#bbbbbb");
        $(".filter-dropdown").css("display","none");
    });
    
    
    //On click of overlay hide all popups
    $(`.hidden-overlay`).on(`click`, ()=> {
        $(`.hidden-overlay`).toggle();
        //
        $(`.add-friend-dropdown`).css(`display`,`none`);
        $(`.home-nav-dropdown`).css(`display`,`none`);
        $(`.home-quick-dropdown`).css(`display`, `none`);
        /* filter icon */
        $("#filterIcon > img").attr("src", "/assets/icons/icons8-filter-96.png");
        $(".filterLabel").css("background-color", "transparent");
        $(".filterLabel > span").css("color", "#bbbbbb");
        $(".filter-dropdown").css("display","none");
    });
    
    //Flash handlers
    setTimeout(() => {
        $(".flash-style").css("transform", "translateX(-500px)");
    }, 5000);
    
    setTimeout(()=> {
        $(".flash-style").css("display", "none");
    }, 10000);
    
    $(".flash-close").on("click", ()=> {
        $(".flash-close").parent().css("transform", "translateX(-500px)");
    });
    //
    
    /* filter Icon scripts */
    
    let filterCounter = 0;
    
    $("#filterIcon").hover(() => {
        $("#filterIcon > img").attr("src", "/assets/icons/icons8-filter-96-hover.png");
        $(".filterLabel").css("background-color", "grey");
        $(".filterLabel > span").css("color", "#fff");
    },()=> {
        if (filterCounter === 0) {
            $("#filterIcon > img").attr("src", "/assets/icons/icons8-filter-96.png");
            $(".filterLabel").css("background-color", "transparent");
            $(".filterLabel > span").css("color", "#bbbbbb");
        }
        else {
            return;
        }
    });
    
    $("#filterIcon").on("click", ()=> {
        $(".filter-dropdown").toggle();
        if ( ($("#filterIcon > img").attr("src") === "/assets/icons/icons8-filter-96-hover.png") && (filterCounter === 0) ) {
            filterCounter = 1;
            $("#filterIcon > img").attr("src", "/assets/icons/icons8-filter-96-hover.png");
            $(".filterLabel").css("background-color", "grey");
            $(".filterLabel > span").css("color", "#fff");
            if ( $(`.add-friend-dropdown`).css(`display`) === `block` || $(`.home-nav-dropdown`).css(`display`) === `block` || $(`.home-quick-dropdown`).css(`display`) === `block`) {
                $(`.hidden-overlay`).css(`display`, `block`);      
            }
            else {
                $(`.hidden-overlay`).toggle();
            }
        }
    
        else if ( ($("#filterIcon > img").attr("src") === "/assets/icons/icons8-filter-96-hover.png") && (filterCounter === 1) ) {
            filterCounter = 0;
            $("#filterIcon > img").attr("src", "/assets/icons/icons8-filter-96.png");
            $(".filterLabel").css("background-color", "transparent");
            $(".filterLabel > span").css("color", "#bbbbbb");
            if ( $(`.add-friend-dropdown`).css(`display`) === `block` || $(`.home-nav-dropdown`).css(`display`) === `block` || $(`.home-quick-dropdown`).css(`display`) === `block`) {
                $(`.hidden-overlay`).css(`display`, `block`);      
            }
            else {
                $(`.hidden-overlay`).toggle();
            }
        }
        $(`.add-friend-dropdown`).css(`display`,`none`);
        $(`.home-nav-dropdown`).css(`display`, `none`);  
        $(`.home-quick-dropdown`).css(`display`, `none`);
    
    });

});