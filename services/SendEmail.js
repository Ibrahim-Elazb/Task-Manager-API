// @ts-nocheck

const htmlEmailConfirmationMsg = ({ user_name, verification_URL, host_name, msg_header, msg_textContent,msg_hint })=> {

                    return `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                        <meta charset="UTF-8">
                        <title>${msg_header}</title>
                        <style>
                            body {
                            font-family: Arial, sans-serif;
                            background-color: #f5f5f5;
                            margin: 0;
                            padding: 0;
                            }
                            .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 5px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                            }
                            h1 {
                            color: #333333;
                            }
                            p {
                            margin-bottom: 20px;
                            line-height: 1.5;
                            }
                            .btn {
                            display: inline-block;
                            background-color: #4CAF50;
                            color: #ffffff;
                            text-decoration: none;
                            padding: 10px 20px;
                            border-radius: 3px;
                            font-weight: bold;
                            }
                        </style>
                        </head>
                        <body>
                        <div class="container">
                            <h1>${msg_header}</h1>
                            <p>Dear <span style="font-weight:bold;font-size:1.1rem;">${user_name}</span>,</p>
                            ${msg_textContent}
                            <p>${verification_URL ? `<a class="btn" href="${verification_URL}">Verify Email Address</a>` : ''}</p>
                            ${msg_hint}
                            <p>Best regards,<br>${host_name} Team</p>
                        </div>
                        </body>
                        </html>
                        `
                        }


/*----------------------------   Using nodejs-nodemailer-outlook Module   -----------------------------------------*/
// var nodeoutlook = require('nodejs-nodemailer-outlook');
// const sendEmail = (receiverEmail,subject,messageText) => {
//      nodeoutlook.sendEmail({
//         auth: {
//             user: process.env.OUTLOOK_EMAIL_ADDRESS,
//             pass: process.env.OUTLOOK_EMAIL_PASSWORD
//         },
//         from: process.env.OUTLOOK_EMAIL_ADDRESS,
//         to: receiverEmail,
//         subject,
//         // text: messageText,
//         html: messageText,
//         onError: (error) => {
//             console.log("Sending Mail Failed")
//             console.log("Error Details: ")
//             console.log(error)
//             throw new HttpError(500, "Sending Mail Failed")
//         },
//         onSuccess: (result) => {
//             console.log("Sending Mail Succeed")
//             // console.log("result is: ")
//             // console.log(result)
//         }
//     });
// }


/*----------------------------   Using @sendgrid/mail Module   -----------------------------------------*/
// const sgMail = require('@sendgrid/mail');
// const sendEmail = (receiverEmail, subject, messageText) => {
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     const msg = {
//         to: receiverEmail,
//         from: 'ibrahim.m.elazb@gmail.com', // Use the email address or domain you verified above
//         subject: subject,
//         //   text: messageText,
//         html: messageText,
//     };
//     //ES6
//     sgMail
//         .send(msg)
//         .then(() => {
//             console.log("Sent Mail Successfully.")
//         }, error => {
//             console.log("Sending Mail Failed")
//             console.log("Error Details: ")
//             if (error.response) {
//                 console.error(error.response.body)
//             }
//             throw error;
//         });
// }


/*----------------------------   Using nodemailer Module   -----------------------------------------*/
const nodemailer = require('nodemailer');
const HTTPError = require('../utils/HTTPError');

const sendEmail = async (receiverEmail, subject, messageText) => {

    const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: process.env.OUTLOOK_EMAIL_ADDRESS,
            pass: process.env.OUTLOOK_EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.OUTLOOK_EMAIL_ADDRESS,
        to: receiverEmail,
        subject: subject,
        // text: messageText,
        html: messageText,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("failed To send email")
            console.error(error);
            throw new HTTPError(500, "Failed To send email")
        } else {
            console.log('Email sent:', info.response);
            // res.send('Email sent successfully');
        }
    });
}

module.exports = { sendEmail, htmlEmailConfirmationMsg };