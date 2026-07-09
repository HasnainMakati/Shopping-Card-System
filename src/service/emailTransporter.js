import nodemailer from "nodemailer";


// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, 
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  connectionTimeout: 1000,
  greetingTimeout: 1000,
  socketTimeout: 1000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
transporter.verify((err, success) => {
  if (err) {
    console.log(err);
  } else {
    console.log("SMTP Connected");
  }
});

export {transporter}