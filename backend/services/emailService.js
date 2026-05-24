const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOTP = async (email, otp) => {
  // DEV BYPASS: Always log the OTP so the user can register even if email fails
  console.log(`\n========================================`);
  console.log(`📧 DEV EMAIL INTERCEPT:`);
  console.log(`To: ${email}`);
  console.log(`Your Verification OTP is: ${otp}`);
  console.log(`========================================\n`);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`
    });
  } catch (error) {
    console.warn(`[Email Service Warning]: Failed to send email to ${email}. Check your Gmail App Password. (OTP was logged above)`);
    // We intentionally don't throw the error so the registration process doesn't break
  }
};