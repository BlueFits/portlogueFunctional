const FriendStatus = require(`../models/friendStatus`);

exports.reqUserFriendStatus = function(profileUser, reqUserId) {

    let status = null;

    let friendButtonVal = {};

        
        switch (status) {
            case (`user`):
                friendButtonVal = {state: ``, val: `Profile`, response: ``, postTo: `404`}
                break;
            case 0:
                friendButtonVal = {state: ``, val: `Add Friend`, response: ``, postTo: `add_friend`}
                break;
            case 1:
                friendButtonVal = {state: `disabled`, val: `Request sent`, response: ``, postTo: `add_friend`}
                break;
            case 1.5: 
                friendButtonVal = {state: ``, val: `Accept request`, response: `true`, postTo: `confirm_friend`}
                break;
            case 2:
                friendButtonVal = {state: `disabled`, val: `Friend`, response: ``, postTo: `add_friend`}
                break;
            case 3:
                friendButtonVal = {state: `disabled`, val: `Request rejected`, response: ``, postTo: `add_friend`}
                break;
        }

}

exports.userHistory = function(reqUser) {

    let displayControl = [];
    let history = [];

                for (let val of reqUser.viewedPortfolios) {
                    displayControl.push(val);
                }

                displayControl = displayControl.reverse();

                for (let i = 0; i < 8; i++) {
                    history.push(displayControl[i]);
                }

                return history.filter(Boolean);

}