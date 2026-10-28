const cron = require("node-cron");

const { runDueReminderScan } = require("../services/dueReminderService");

/*
|--------------------------------------------------------------------------
| Due Reminder Cron Job
|--------------------------------------------------------------------------
|
| Runs the due reminder scan once a day at 10:30 AM (Asia/Kolkata):
| loans due in 3 days, 1 day, today, or newly overdue get an in-app
| notification and an SMS reminder to the registered mobile number.
|
| Set DISABLE_DUE_REMINDER_CRON=true in the environment to turn the
| schedule off (the scan can still be run on demand through
| POST /api/notifications/run-due-reminders).
|
*/

let started = false;

const startDueReminderJob = () => {
  if (started) {
    return;
  }

  if (process.env.DISABLE_DUE_REMINDER_CRON === "true") {
    console.log("Due reminder job disabled by configuration.");
    return;
  }

  cron.schedule(
    "30 10 * * *",
    async () => {
      try {
        const summary = await runDueReminderScan();

        console.log("Due reminder scan completed:", summary);
      } catch (error) {
        console.error("Due reminder scan failed:", error.message);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  started = true;

  console.log(
    "Due reminder job scheduled: daily at 10:30 Asia/Kolkata."
  );
};

module.exports = {
  startDueReminderJob,
};
