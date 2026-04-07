export const email_Template = (otp, email) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Password Reset OTP</title>
  <style>
    .preheader {
      display: none !important;
      visibility: hidden;
      opacity: 0;
      color: transparent;
      height: 0;
      width: 0;
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

  <!-- Preheader -->
  <div class="preheader">
    Your OTP code to reset your password. This code expires in 2 minutes.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff; margin:40px 0; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#721b65; padding:25px; text-align:center;">
              <img src="https://res.cloudinary.com/demukyop6/image/upload/v1775558385/MyPetLogos_qybhl8.png" 
                   alt="MyPets Store" 
                   width="120" 
                   style="display:block; margin:0 auto 10px;" />
              
              <h1 style="color:#ffd868; margin:0; font-size:22px;">
                MyPets Store
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px; text-align:center;">

              <h2 style="margin:0; color:#2c2c2c;">
                Reset Your Password
              </h2>

              <p style="color:#555; margin:20px 0;">
                Hi <strong>${email}</strong>,<br/>
                Use the OTP below to reset your password.
              </p>

              <!-- OTP BOX -->
              <div style="
                display:inline-block;
                padding:15px 25px;
                background:#f8f8f8;
                border:2px dashed #721b65;
                border-radius:10px;
                font-size:30px;
                letter-spacing:10px;
                font-weight:bold;
                color:#721b65;
                margin:25px 0;
              ">
                ${otp}
              </div>

              <p style="color:#888; font-size:14px;">
                This OTP is valid for 
                <strong style="color:#721b65;">2 minutes</strong>.
              </p>

              <p style="color:#999; font-size:13px; margin-top:20px;">
                If you didn’t request a password reset, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 30px;">
              <hr style="border:none; border-top:1px solid #eee;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#474654; padding:20px; text-align:center;">

              <p style="margin:0; font-size:12px; color:#e8e8e8;">
                © 2026 MyPets Store. All rights reserved.
              </p>

              <p style="margin:5px 0 0; font-size:11px; color:#a1a1a1;">
                Built with ❤️ for pets lovers 🐾
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
};