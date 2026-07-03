import { Verification_Email_Template } from "./emailTemplate.js";
import { transporter } from "./emailTransporter.js";

const sendEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email, 
      subject: "Verify your email", 
      text: "we are heard you forget your password, don't worry ",
      html: Verification_Email_Template.replace("{verificationCode}",otp),
    });
  } catch (error) {
    console.error("Error while sending mail:", error.message);
  }
};

export { sendEmail };
