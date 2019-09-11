const nodemailer = require(`nodemailer`);
const nodemailMailgun = require(`nodemailer-mailgun-transport`);
const mailerconfig = require(`../config/mailerConfig`);

// Transporter
exports.transporter = nodemailer.createTransport( nodemailMailgun(mailerconfig) );