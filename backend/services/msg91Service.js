
const axios = require("axios");

const sendOTPViaMSG91 = async (mobileNumber, otp) => {
  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_OTP_TEMPLATE_ID;
    const otpExpiry = process.env.MSG91_OTP_EXPIRY || "10";

    if (!authKey) {
      throw new Error("MSG91_AUTH_KEY is not configured.");
    }

    if (!templateId) {
      throw new Error("MSG91_OTP_TEMPLATE_ID is not configured.");
    }

    const cleanedMobileNumber = String(mobileNumber).replace(
      /\D/g,
      ""
    );

    if (!/^[6-9]\d{9}$/.test(cleanedMobileNumber)) {
      throw new Error("Invalid Indian mobile number.");
    }

    const internationalMobileNumber = `91${cleanedMobileNumber}`;

    const params = new URLSearchParams({
      template_id: templateId,
      mobile: internationalMobileNumber,
      otp: String(otp),
      otp_expiry: String(otpExpiry),
      otp_length: "6",
      realTimeResponse: "1",
    });

    const response = await axios.post(
      `https://control.msg91.com/api/v5/otp?${params.toString()}`,
      {},
      {
        headers: {
          authkey: authKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("MSG91 OTP response:", response.data);

    if (response.data?.type !== "success") {
      throw new Error(
        response.data?.message ||
          "MSG91 failed to send the OTP."
      );
    }

    return {
      success: true,
      requestId: response.data?.request_id || null,
      response: response.data,
    };
  } catch (error) {
    console.error(
      "MSG91 OTP Error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Unable to send OTP through MSG91."
    );
  }
};

module.exports = {
  sendOTPViaMSG91,
};
