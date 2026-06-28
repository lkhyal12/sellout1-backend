import jwt from "jsonwebtoken";
import { transporter } from "./nodemailer.js";
export function generateTokens(user) {
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
  return { accessToken, refreshToken };
}

export function logError(funName, err) {
  console.log(`error in the ${funName} ${err}`);
}

export function userObj(user) {
  return {
    name: user.name,
    role: user.role,
    email: user.email,
    userId: user._id,
    cart: user.cart,
  };
}

// send email verification code
export async function sendEmailVerification(user, code) {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Email verification",
      text: `Hello ${user.name} Thank you for signing up!`,
      html: emailTemplate(code, user),
    });
    return { success: true };
  } catch (err) {
    console.log("error in the sendEmailVerifcation ", err);
    return { success: false };
  }
}

function emailTemplate(code, user) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Email Verification</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;padding:40px;">
          <tr>
            <td align="center">

              <h1 style="margin:0;color:#222;">
                Verify Your Email
              </h1>

              <p style="font-size:16px;color:#555;margin-top:25px;">
                Hi <strong>${user.name}</strong>,
              </p>

              <p style="font-size:16px;color:#555;line-height:1.7;">
                Thank you for creating an account.
                Please use the verification code below to verify your email address.
              </p>

              <div
                style="
                  display:inline-block;
                  margin:30px 0;
                  padding:18px 35px;
                  background:#4f46e5;
                  color:#ffffff;
                  font-size:34px;
                  font-weight:bold;
                  letter-spacing:8px;
                  border-radius:8px;
                "
              >
                ${code}
              </div>

              <p style="font-size:15px;color:#777;">
                This code will expire in
                <strong>15 minutes</strong>.
              </p>

              <hr style="border:none;border-top:1px solid #eee;margin:35px 0;">

              <p style="font-size:13px;color:#999;line-height:1.6;">
                If you didn't create this account,
                you can safely ignore this email.
              </p>

              <p style="font-size:13px;color:#999;">
                © 2026 Your App
              </p>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}
