module.exports = function(secretToken) {

    let confirmationEmail = `<h1>Thank you for registering!</h1>
    <br/>
    <p>Please click the link to finish registration. </p><a href="https://www.portlogue.com/confirm/${secretToken}">Click here</a>`;

    return confirmationEmail;
    
}