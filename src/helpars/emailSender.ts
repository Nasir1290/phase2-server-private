// import nodemailer from "nodemailer";
// import config from "../config";
// import ApiError from "../errors/ApiErrors";

// const emailSender = async (subject: string, email: string, html: string) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: config.emailSender.email,
//       pass: config.emailSender.app_pass,
//     },
//   });

//   const emailTransport = transporter;

//   const mailOptions = {
//     from: `"How's" <${config.emailSender.email}>`,
//     to: email,
//     subject,
//     html,
//   };

//   // Send the email
//   try {
//     const info = await emailTransport.sendMail(mailOptions);
//     // console.log("Email sent: " + info.response);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new ApiError(500, "Error sending email");
//   }
// };

// export default emailSender;




import nodemailer from "nodemailer"

import config from "../config"

 const emailSender = async ( subject: string,to: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 2525,
      secure: false, // Use TLS, `false` ensures STARTTLS
      auth: {
        user: config.emailSender.send_email, // Your email address
        pass: config.emailSender.app_pass, // Your app-specific password
      },
    })

    const mailOptions = {
      from: `"Bittengo Team" <${config.emailSender.email}>`, // Sender's name and email
      to, // Recipient's email
      subject, // Email subject
      text: html.replace(/<[^>]+>/g, ""), // Generate plain text version by stripping HTML tags
      html, // HTML email body
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions)

    // Log the success message
    console.log(`Email sent: ${info.messageId}`)
    return info.messageId
  } catch (error) {
    // @ts-ignore
    console.error(`Error sending email: ${error.message}`)
    throw new Error("Failed to send email. Please try again later.")
  }
}

export default emailSender;