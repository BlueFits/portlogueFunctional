
/* Needed outside document ready */

/* Feedback jquery */

$("#got-feedback-button").on("click", ()=> {
    $("#got-feedback-button").addClass("feedback-button-hide");
    $("#feedback-container").addClass("feedback-container-active");
});

$(".feedback-close").on("click", ()=> {
    $("#got-feedback-button").removeClass("feedback-button-hide");
    $("#feedback-container").removeClass("feedback-container-active");
});

$("#feedback-form").on("submit", ()=> {
    event.preventDefault();

    $(`#feedback-form-submit`).css(`background-color`, "transparent");
    $(`#feedback-form-submit`).html(`<div class="loaderD"></div>`);

    let email = $("#feedback-email").val();

    let message = $("#feedback-message").val();


        $.ajax({
            url: "/submit_feedback",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ email, message }),
            success: (data)=> {
                //Empty
                console.log(data);
                setTimeout(() => {
                    $(`#feedback-form-submit`).css(`color`, "#3498db");
                    $(`#feedback-form-submit`).html(`Sent ✓`);
                }, 2000);
                setTimeout(() => {
                    $("#got-feedback-button").removeClass("feedback-button-hide");
                    $("#feedback-container").removeClass("feedback-container-active");
                }, 3000);
            }
        });
});

/* Click out jquery */

!function(e,n){var t="function"==typeof require?require:function(e){return{jquery:jQuery}[e]};"object"==typeof exports&&"undefined"!=typeof module?module.exports=n(t):"function"==typeof define&&define.amd?define(["jquery"],n.bind(e,t)):e.jQueryClickout=n(t)}(this,function(e,n,t,r){return function o(n,t,r){function u(c,f){if(!t[c]){if(!n[c]){var l="function"==typeof e&&e;if(!f&&l)return l(c,!0);if(i)return i(c,!0);var a=new Error("Cannot find module '"+c+"'");throw a.code="MODULE_NOT_FOUND",a}var d=t[c]={exports:{}};n[c][0].call(d.exports,function(e){var t=n[c][1][e];return u(t?t:e)},d,d.exports,o,n,t,r)}return t[c].exports}for(var i="function"==typeof e&&e,c=0;c<r.length;c++)u(r[c]);return u}({1:[function(e,n,t){var r=e("jquery"),o=r(document),u={},i=!1;r.event.special.clickout={setup:function(e,n,t){i||(o.on("click.clickout-handler",function(e){r.each(u,function(n,t){var o=!0;r.each(t.elements,function(n,t){r(e.target).closest(t).length&&(o=!1)}),o&&t.handler.call(r(t.elements),e)})}),i=!0)},teardown:function(){u||(o.off("click.clickout-handler"),i=!1)},add:function(e){var n=e.guid;u.hasOwnProperty(n)?u[n].elements.push(this):u[n]={elements:[this],handler:e.handler}},remove:function(e){delete u[e.guid]}}},{jquery:"jquery"}]},{},[1])(1)});
//# sourceMappingURL=jquery-clickout.min.js.map

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
    
        if ($(`.add-friend-dropdown`).css(`display`) === `block` ||  $(`.home-quick-dropdown`).css(`display`) === `block`) {
            $(`.hidden-overlay`).css(`display`, `block`);       
        }
    
        else {
            $(`.hidden-overlay`).toggle();
        }
    
        $(`.add-friend-dropdown`).css(`display`,`none`);
        $(`.home-quick-dropdown`).css(`display`, `none`);
    });
    
    $(`#qs-dropdown`).on(`click`, ()=> {
        $(`.home-quick-dropdown`).toggle();
    
        if ($(`.add-friend-dropdown`).css(`display`) === `block` || $(`.home-nav-dropdown`).css(`display`) === `block`) {
            $(`.hidden-overlay`).css(`display`, `block`);       
        }
    
        else {
            $(`.hidden-overlay`).toggle();
        }
        
        $(`.add-friend-dropdown`).css(`display`,`none`);
        $(`.home-nav-dropdown`).css(`display`, `none`);  

    });
    
    $(`#friend-drop`).on(`click`, ()=> {
        $(`.add-friend-dropdown`).toggle();
    
        if ($(`.home-nav-dropdown`).css(`display`) === `block` ||  $(`.home-quick-dropdown`).css(`display`) === `block`) {
            $(`.hidden-overlay`).css(`display`, `block`);
        }
    
        else {
            $(`.hidden-overlay`).toggle();
        }
    
        $(`.home-nav-dropdown`).css(`display`, `none`);
        $(`.home-quick-dropdown`).css(`display`, `none`); 
    });
    
    
    //On click of overlay hide all popups
    $(`.hidden-overlay`).on(`click`, ()=> {
        $(`.hidden-overlay`).toggle();
        //
        $(`.add-friend-dropdown`).css(`display`,`none`);
        $(`.home-nav-dropdown`).css(`display`,`none`);
        $(`.home-quick-dropdown`).css(`display`, `none`);
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
        $(".filter-dropdown").toggleClass("filter-active");
        if ( ($("#filterIcon > img").attr("src") === "/assets/icons/icons8-filter-96-hover.png") && (filterCounter === 0) ) {
            filterCounter = 1;
            $("#filterIcon > img").attr("src", "/assets/icons/icons8-filter-96-hover.png");
            $(".filterLabel").css("background-color", "grey");
            $(".filterLabel > span").css("color", "#fff");
        }
    
        else if ( ($("#filterIcon > img").attr("src") === "/assets/icons/icons8-filter-96-hover.png") && (filterCounter === 1) ) {
            filterCounter = 0;
            $("#filterIcon > img").attr("src", "/assets/icons/icons8-filter-96.png");
            $(".filterLabel").css("background-color", "transparent");
            $(".filterLabel > span").css("color", "#bbbbbb");        
        }
    });

});