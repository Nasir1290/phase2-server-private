import nodemailer from "nodemailer";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpars/emailSender";

const sendEmailFromContactUs = async (data: {
  name: string;
  email: string;
  phoneNumber?: string;
  message: string;
}) => {
  const { name, email, phoneNumber, message } = data;
  if ( !name || !email || !message) {
    throw new ApiError(400, "All fields are required");
  }


  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: config.emailSender.email,
    subject: "Contact With Admin",
    html: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Us Inquiry</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; font-size: 16px; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="background-color: #FF7600; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; font-size: 24px; margin: 0;">New Contact Us Inquiry</h2>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin-bottom: 15px;">Dear Support Team,</p>
            
            <p style="margin-bottom: 15px;">
                My name is <strong style="color: #FF7600; font-size: 18px;">${name}</strong>, and I am reaching out to you regarding the following matter:
            </p>

            <blockquote style="font-style: italic; background-color: #f9f9f9; padding: 15px; border-left: 5px solid #FF7600; margin: 0 0 20px 0; border-radius: 5px;">
                ${message}
            </blockquote>

            <p style="margin-bottom: 15px;">Here are my contact details for your reference:</p>
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; background-color: #f9f9f9; border-radius: 5px; overflow: hidden;">
                <tr>
                    <td style="padding: 10px 15px; border-bottom: 1px solid #eeeeee;">
                        <strong style="color: #FF7600;">Email:</strong> 
                        <a href="mailto:${email}" style="color: #333; text-decoration: underline; transition: color 0.3s ease;">${email}</a>
                    </td>
                </tr>
                ${
                  phoneNumber
                    ? `<tr>
                    <td style="padding: 10px 15px;">
                        <strong style="color: #FF7600;">Phone Number:</strong> ${phoneNumber}
                    </td>
                </tr>`
                    : ""
                }
            </table>

            <p style="margin-top: 20px;">I appreciate your time and hope to receive a response soon.</p>
            
            <p style="margin-bottom: 5px;">Best regards,</p>
            <p style="font-weight: bold; color: #FF7600; font-size: 18px; margin-top: 0;">${name}</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 14px; color: #888;">
            <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `,
  };

  await emailSender(mailOptions.subject,mailOptions.to as string,mailOptions.html)
  return "Email sent successfully";
};

export const contactUsServices = {
  sendEmailFromContactUs,
};
