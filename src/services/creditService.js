import { supabase } from "../lib/supabaseClient";

/*
|--------------------------------------------------------------------------
| Credit score / health / history / improvement plan — Supabase
|--------------------------------------------------------------------------
| Same return shapes the components were built against. The
| improvement-plan rules are the ones the old Express backend used.
*/

const latestScoreRow = async () => {
  const { data, error } = await supabase
    .from("credit_scores")
    .select("*")
    .order("score_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const statusFor = (score) =>
  score >= 750
    ? "Excellent"
    : score >= 700
      ? "Good"
      : score >= 650
        ? "Fair"
        : "Needs Improvement";

export const getCreditScore = async () => {
  const row = await latestScoreRow();

  if (!row) {
    return {
      success: false,
      message:
        "Credit score unavailable. No credit data is available for this account yet.",
    };
  }

  return {
    success: true,
    score: row.score,
    range: { min: 300, max: 900 },
    status: statusFor(row.score),
    lastUpdated: row.score_date,
    source: row.source,
  };
};

export const getCreditHealth = async () => {
  const row = await latestScoreRow();

  if (!row) {
    return {
      success: false,
      message: "Credit health data not found",
    };
  }

  const overallHealth = Math.round(
    (row.payment_history +
      Math.max(0, 100 - row.credit_utilization) +
      row.credit_age +
      row.credit_accounts) /
      4
  );

  return {
    success: true,
    overallHealth,
    health: {
      paymentHistory: row.payment_history,
      creditUtilization: row.credit_utilization,
      creditAge: row.credit_age,
      creditAccounts: row.credit_accounts,
    },
    score: row.score,
    lastUpdated: row.score_date,
  };
};

export const getScoreHistory = async () => {
  const { data, error } = await supabase
    .from("credit_scores")
    .select("score, score_date, source")
    .order("score_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    history: (data || []).map((row) => ({
      score: row.score,
      scoreDate: row.score_date,
      source: row.source,
    })),
  };
};

export const getImprovementPlan = async () => {
  const row = await latestScoreRow();

  if (!row) {
    return {
      success: false,
      message:
        "Credit improvement plan unavailable until credit data is available for this account.",
    };
  }

  const plan = [];

  if (row.payment_history < 90) {
    plan.push({
      title: "Improve Payment History",
      description:
        "Pay credit card bills and EMIs on or before their due dates.",
      priority: "High",
    });
  }

  if (row.credit_utilization > 30) {
    plan.push({
      title: "Reduce Credit Utilization",
      description:
        "Try to keep your credit utilization below 30% where practical.",
      priority: "High",
    });
  }

  if (row.credit_age < 60) {
    plan.push({
      title: "Maintain Older Credit Accounts",
      description: "Avoid unnecessarily closing older credit accounts.",
      priority: "Medium",
    });
  }

  if (row.credit_accounts < 60) {
    plan.push({
      title: "Maintain a Healthy Credit Mix",
      description:
        "Manage existing credit accounts responsibly and avoid unnecessary applications.",
      priority: "Medium",
    });
  }

  plan.push({
    title: "Monitor Your Credit Score",
    description:
      "Review your credit information regularly for changes or incorrect information.",
    priority: "Low",
  });

  return {
    success: true,
    estimatedTimeline:
      "Consistent positive payment behavior may take several months to reflect in credit information. Actual changes vary by individual credit profile.",
    plan,
  };
};
