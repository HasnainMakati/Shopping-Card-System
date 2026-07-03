export const Verification_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f4f7;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb, #1e40af);
      color: #ffffff;
      text-align: center;
      padding: 25px;
      font-size: 26px;
      font-weight: bold;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.7;
      font-size: 15px;
    }
    .otp-box {
      margin: 25px auto;
      text-align: center;
      font-size: 28px;
      letter-spacing: 6px;
      font-weight: bold;
      color: #1e40af;
      background-color: #eef2ff;
      padding: 15px;
      border-radius: 8px;
      border: 1px dashed #1e40af;
      width: fit-content;
    }
    .info {
      background: #f9fafb;
      padding: 15px;
      border-left: 4px solid #2563eb;
      margin-top: 20px;
      font-size: 14px;
      color: #555;
    }
    .footer {
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #777;
      background-color: #f2f4f7;
      border-top: 1px solid #e5e7eb;
    }
    p {
      margin: 0 0 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Reset Your Password</div>
    <div class="content">
      <p>Hello,</p>

      <p>
        We received a request to reset the password for your account.
        Please use the verification code below to proceed with resetting your password.
      </p>

      <div class="otp-box">{verificationCode}</div>

      <p>
        This verification code is valid for <strong>5 minutes</strong>.
        Do not share this code with anyone for security reasons.
      </p>

      <div class="info">
        <p>
          If you did not request a password reset, please ignore this email.
          Your account will remain secure.
        </p>
      </div>

      <p>
        If you need further assistance, feel free to contact our support team.
      </p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Novo Trends. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
