import nodemailer from "nodemailer";
import config from "../config/config";
import SMTPTransport from "nodemailer/lib/smtp-transport";

interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

async function sendResetPasswordMail(options: MailOptions) {
    const transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> =
        nodemailer.createTransport({
            host: "smtp.gmail.com",
            service: "gmail",
            port: 465,
            secure: true,
            auth: {
                user: config.emailUser || process.env.EMAIL_USER,
                pass: config.emailPassword || process.env.EMAIL_PASSWORD,
            },
        });

    let info = await transporter.sendMail(
        {
            from: options.from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        },
        (error, infor) => {
            if (error) {
                console.log(error);
            }else{
                console.log("mail has been send",infor.response)
                console.log( infor.messageId);
            }
        },
    );

}



export default sendResetPasswordMail;
