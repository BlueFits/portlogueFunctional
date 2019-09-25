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