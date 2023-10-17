import rateLimit from "express-rate-limit";

export const defaultLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 100,
    message: "Too many request from this ip try again after 5 min",
});
export const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 4, // Limit each IP to 2 create account requests per hour)
    message:
        "Too many accounts created from this IP, please try again after an hour",
});
export const forgetPasswordLimiter = rateLimit({
    windowMs: 2 * 60 * 60 * 1000,
    limit: 2,
    message: "Too many attemot from this IP, please try again after 2 hour",
});
export const ResetPasswordLimiter = rateLimit({
    windowMs: 2 * 60 * 60 * 1000,
    limit: 2,
    message:
        "Too many accounts created from this IP, please try again after 2 hour",
});
