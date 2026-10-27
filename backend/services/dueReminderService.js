const Loan = require("../models/Loan");
const Notification = require("../models/Notification");
const { sendNotificationSMS } = require("./smsService");

/*
|--------------------------------------------------------------------------
| Due Reminder Scan
|--------------------------------------------------------------------------
|
| One scan powers both the daily cron job and the manual
| "run-due-reminders" endpoint. For every loan with reminders enabled
| it checks the days left until the due date and acts on milestones:
|
|   15 days before -> "Due Soon"   notification + SMS
|   10 days before -> "Due Soon"   notification + SMS
|   7..1 days      -> "Due Soon"   notification + SMS, every day
|   due today      -> "Due Today"  notification + SMS
|   1-2 days late  -> "Overdue"    notification + SMS (loan marked
|                     Overdue, mirroring the existing reminder flows)
|
| At most one notification + SMS per loan per milestone per day: an
| existing notification of the same type created today suppresses a
| repeat, so a user is never spammed by a re-run.
|
| The scan never throws for a single bad loan or a failed SMS; it
| collects a summary instead so the cron log stays meaningful.
|
*/

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const daysUntil = (dueDate) => {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil(
    (due.getTime() - startOfToday().getTime()) / (1000 * 60 * 60 * 24)
  );
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const milestoneFor = (days) => {
  // Reminder pattern (product spec):
  // - one reminder 15 days before the due date
  // - one reminder 10 days before the due date
  // - a reminder every day from 7 days before until the due date
  // - a reminder on each of the 2 days after the due date (overdue)
  if (days === 15 || days === 10 || (days >= 1 && days <= 7)) {
    return {
      type: "Due Soon",
      title: "Payment Due Soon",
    };
  }

  if (days === 0) {
    return {
      type: "Due Today",
      title: "Payment Due Today",
    };
  }

  if (days === -1 || days === -2) {
    return {
      type: "Overdue",
      title: "Payment Overdue",
    };
  }

  return null;
};

const inAppMessage = (loan, days, milestone) => {
  if (milestone.type === "Due Soon") {
    return (
      `${loan.loanName} payment is due in ${days} day${
        days === 1 ? "" : "s"
      }. ` + "Please keep the EMI amount ready."
    );
  }

  if (milestone.type === "Due Today") {
    return (
      `${loan.loanName} payment is due today. ` +
      "Please make the payment today to maintain positive payment behavior."
    );
  }

  return (
    `${loan.loanName} payment is overdue. ` +
    "Please make the payment as soon as possible to avoid further negative impact on your simulated credit score."
  );
};

const smsMessage = (loan, days, milestone) => {
  const amount = loan.emiAmount
    ? ` of Rs.${loan.emiAmount}`
    : "";
  const dueText = `payment${amount} for ${loan.loanName}`;

  if (milestone.type === "Due Soon") {
    return (
      `CrediGuide reminder: Your ${dueText} is due on ` +
      `${formatDate(loan.dueDate)} (${days} day${days === 1 ? "" : "s"} left). ` +
      "Please keep the amount ready."
    );
  }

  if (milestone.type === "Due Today") {
    return (
      `CrediGuide reminder: Your ${dueText} is due today, ` +
      `${formatDate(loan.dueDate)}. Please pay on time to protect your credit score.`
    );
  }

  return (
    `CrediGuide alert: Your ${dueText} was due on ` +
    `${formatDate(loan.dueDate)} and is now overdue. ` +
    "Please pay immediately to avoid further impact on your credit score."
  );
};

const runDueReminderScan = async ({ onlyUserId } = {}) => {
  const summary = {
    loansScanned: 0,
    notificationsCreated: 0,
    smsSent: 0,
    smsFailed: 0,
    skippedDuplicates: 0,
  };

  const query = {
    reminderEnabled: true,
    status: { $in: ["Active", "Overdue", "Missed"] },
  };

  if (onlyUserId) {
    query.user = onlyUserId;
  }

  const loans = await Loan.find(query).populate(
    "user",
    "fullName mobileNumber email"
  );

  for (const loan of loans) {
    summary.loansScanned += 1;

    try {
      if (!loan.dueDate || !loan.user) {
        continue;
      }

      const days = daysUntil(loan.dueDate);
      const milestone = milestoneFor(days);

      if (!milestone) {
        continue;
      }

      if (days < 0 && loan.status !== "Overdue") {
        loan.status = "Overdue";
        await loan.save();
      }

      const alreadyCreatedToday = await Notification.findOne({
        user: loan.user._id,
        loan: loan._id,
        type: milestone.type,
        createdAt: { $gte: startOfToday() },
      });

      if (alreadyCreatedToday) {
        summary.skippedDuplicates += 1;
        continue;
      }

      await Notification.create({
        user: loan.user._id,
        loan: loan._id,
        type: milestone.type,
        title: milestone.title,
        message: inAppMessage(loan, days, milestone),
        isRead: false,
      });

      summary.notificationsCreated += 1;

      if (loan.user.mobileNumber) {
        try {
          await sendNotificationSMS(
            loan.user.mobileNumber,
            smsMessage(loan, days, milestone)
          );

          summary.smsSent += 1;
        } catch (smsError) {
          summary.smsFailed += 1;

          console.error(
            `Due reminder SMS failed for loan ${loan._id}:`,
            smsError.message
          );
        }
      }
    } catch (loanError) {
      console.error(
        `Due reminder scan failed for loan ${loan._id}:`,
        loanError.message
      );
    }
  }

  return summary;
};

module.exports = {
  runDueReminderScan,
};
