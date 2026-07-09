import { ApiError } from "../utils/ApiError.js";
import { Verification_Email_Template } from "./emailTemplate.js";
import { transporter } from "./emailTransporter.js";

const sendEmail = async (email, otp) => {
  console.log("Sending OTP to: ", email);
  try {
    const info = await transporter.sendMail({
     from: `"Novo Trends" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Verify your email",
      text: "we are heard you forget your password, don't worry ",
      html: Verification_Email_Template.replace("{verificationCode}", otp),
    });

    console.log(info.messageId);

  } catch (error) {
    console.error("Error while sending mail:", error);
    throw new ApiError(400,"Send email failed",[error.message])
  }
};



export { sendEmail };
