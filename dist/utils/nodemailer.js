"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config/config"));
async function sendResetPasswordMail(options) {
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
            user: config_1.default.emailUser || process.env.EMAIL_USER,
            pass: config_1.default.emailPassword || process.env.EMAIL_PASSWORD,
        },
    });
    let info = await transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    }, (error, infor) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log("mail has been send", infor.response);
            console.log(infor.messageId);
        }
    });
}
exports.default = sendResetPasswordMail;
//# sourceMappingURL=nodemailer.js.map