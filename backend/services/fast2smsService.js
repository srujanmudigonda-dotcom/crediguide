const axios = require("axios");

/*
|--------------------------------------------------------------------------
| Fast2SMS Service
|--------------------------------------------------------------------------
|
| Sends SMS through the Fast2SMS Dev API (bulkV2). The Quick route
| (route=q) is used for both OTPs and free-text reminder messages: it
| sends under Fast2SMS's own DLT registration and sender ID, so no
| CrediGuide DLT registration is required.
|
| Requires FAST2SMS_API_KEY in the backend environment.
|
*/

const cleanIndianMobile = (mobileNumber) => {
  const cleanedMobileNumber = String(mobileNumber).replace(/\D/g, "");

  if (!/^[6-9]\d{9}$/.test(cleanedMobileNumber)) {
    throw new Error("Invalid Indian mobile number.");
  }

  return cleanedMobileNumber;
};

const postBulkV2 = async (payload) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    throw new Error("FAST2SMS_API_KEY is not configured.");
  }

  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      payload,
      {
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json",
        },
        // SMS gateways can be slow to answer; do not give up early.
        timeout: 60000,
      }
    );

    if (response.data?.return !== true) {
      const message = Array.isArray(response.data?.message)
        ? response.data.message.join(" ")
        : response.data?.message;

      throw new Error(message || "Fast2SMS failed to send the SMS.");
    }

    return {
      success: true,
      requestId: response.data?.request_id || null,
      response: response.data,
    };
  } catch (error) {
    const apiMessage = error.response?.data?.message;
    const readable = Array.isArray(apiMessage)
      ? apiMessage.join(" ")
      : apiMessage;

    console.error(
      "Fast2SMS Error:",
      readable || error.message
    );

    throw new Error(
      readable || error.message || "Unable to send SMS through Fast2SMS."
    );
  }
};

/*
|--------------------------------------------------------------------------
| Send OTP SMS
|--------------------------------------------------------------------------
|
| The OTP itself is generated and verified by CrediGuide's backend
| (authController); Fast2SMS only transports the message.
|
*/

const sendOTPViaFast2SMS = async (mobileNumber, otp) => {
  const mobile = cleanIndianMobile(mobileNumber);

  return postBulkV2({
    route: "q",
    message:
      `Your OTP for CrediGuide is ${otp}. ` +
      "It is valid for 10 minutes. Please do not share it with anyone.",
    language: "english",
    flash: 0,
    numbers: mobile,
  });
};

/*
|--------------------------------------------------------------------------
| Send a free-text SMS (due-date reminders and notifications)
|--------------------------------------------------------------------------
*/

const sendSMSViaFast2SMS = async (mobileNumber, message) => {
  const mobile = cleanIndianMobile(mobileNumber);

  return postBulkV2({
    route: "q",
    message,
    language: "english",
    flash: 0,
    numbers: mobile,
  });
};

module.exports = {
  sendOTPViaFast2SMS,
  sendSMSViaFast2SMS,
};
