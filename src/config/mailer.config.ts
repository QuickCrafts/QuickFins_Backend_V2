import nodemailer from "nodemailer";

export const mailModule = () => {
  const emailPassword = process.env.EMAIL_PASSWORD;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "quickfinscol@gmail.com",
      pass: emailPassword,
    },
  });
};
