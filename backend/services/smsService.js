const { sendOTPViaMSG91 } = require("./msg91Service");
const {
  sendOTPViaFast2SMS,
  sendSMSViaFast2SMS,
} = require("./fast2smsService");

/*
|--------------------------------------------------------------------------
| SMS Dispatcher
|--------------------------------------------------------------------------
|
| One entry point for every SMS the backend sends. The provider is
| chosen by the SMS_PROVIDER environment variable:
|
| - "fast2sms" (default): Fast2SMS Quick route. Sends under Fast2SMS's
|   own DLT registration, so OTPs and reminders deliver without a
|   CrediGuide DLT registration.
| - "msg91": the legacy MSG91 OTP service. Kept intact for the day the
|   team completes its own DLT registration; until then MSG91 accepts
|   OTP requests but the carrier parks them ("DLT Template Id not
|   found").
|
| DEV_OTP_MODE=true still short-circuits OTPs to the server terminal
| for local development and never sends a real SMS.
|
*/

const activeProvider = () =>
  (process.env.SMS_PROVIDER || "fast2sms").toLowerCase();

/*
|--------------------------------------------------------------------------
| Send an OTP (registration and login verification)
|--------------------------------------------------------------------------
*/

const sendOTP = async (mobileNumber, otp) => {
  if (process.env.DEV_OTP_MODE === "true") {
    return {
      success: true,
      developmentMode: true,
    };
  }

  if (activeProvider() === "msg91") {
    await sendOTPViaMSG91(mobileNumber, otp);
  } else {
    await sendOTPViaFast2SMS(mobileNumber, otp);
  }

  return {
    success: true,
    developmentMode: false,
    provider: activeProvider(),
  };
};

/*
|--------------------------------------------------------------------------
| Send a notification SMS (due-date reminders)
|--------------------------------------------------------------------------
|
| Reminders are never suppressed by DEV_OTP_MODE: a reminder that only
| prints to a terminal helps nobody. Free-text sending currently exists
| only on the Fast2SMS side of this codebase (the MSG91 service sends
| OTP-template messages only), so reminders require Fast2SMS.
|
*/

const sendNotificationSMS = async (mobileNumber, message) => {
  if (!process.env.FAST2SMS_API_KEY) {
    throw new Error(
      "Notification SMS requires FAST2SMS_API_KEY to be configured."
    );
  }

  return sendSMSViaFast2SMS(mobileNumber, message);
};

module.exports = {
  sendOTP,
  sendNotificationSMS,
};
