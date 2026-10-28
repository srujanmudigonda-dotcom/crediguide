const CibilSimulator = require("../models/CibilSimulator");
const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| Simulated Credit Score Profile Helpers
|--------------------------------------------------------------------------
|
| One place that owns the CibilSimulator profile lifecycle:
|
| - ensureScoreProfile(userId)
|     Returns the user's simulated score profile, creating it from the
|     CIBIL score the user entered during registration when it does not
|     exist yet. This guarantees every registered user always has a
|     profile, so the dashboard widget never comes up empty.
|
| - applyScoreChange({ userId, change, action, loanName, amount, notes })
|     Applies a signed point change to the current simulated score,
|     clamped to the 300-900 range, and records it in the score history.
|     Returns the previous score, the new score and the change that was
|     actually applied (after clamping).
|
| This is an educational simulation only. It is NOT an official
| TransUnion CIBIL score and does not use the CIBIL formula.
|
*/

const clampScore = (value) => Math.min(900, Math.max(300, value));

const startingScoreFor = (user) => {
  const score = Number(user?.currentCibilScore);
  return Number.isFinite(score) && score >= 300 && score <= 900
    ? score
    : 750;
};

const ensureScoreProfile = async (userId) => {
  let profile = await CibilSimulator.findOne({ user: userId });

  if (profile) {
    return profile;
  }

  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  const start = startingScoreFor(user);

  profile = await CibilSimulator.create({
    user: userId,
    startingScore: start,
    currentScore: start,
    activeLoans: [],
    scoreHistory: [
      {
        previousScore: start,
        change: 0,
        newScore: start,
        action: "Starting Score",
        loanName: "",
        amount: 0,
        notes: "Starting score provided during registration.",
        date: new Date(),
      },
    ],
  });

  return profile;
};

const applyScoreChange = async ({
  userId,
  change,
  action,
  loanName = "",
  amount = 0,
  notes = "",
}) => {
  const profile = await ensureScoreProfile(userId);

  if (!profile) {
    return null;
  }

  const previousScore = Number(profile.currentScore);
  const newScore = clampScore(previousScore + Number(change || 0));
  const appliedChange = newScore - previousScore;

  profile.currentScore = newScore;

  profile.scoreHistory.push({
    previousScore,
    change: appliedChange,
    newScore,
    action,
    loanName: loanName || "",
    amount: Number(amount || 0),
    notes: notes || "",
    date: new Date(),
  });

  await profile.save();

  return { profile, previousScore, newScore, appliedChange };
};

module.exports = {
  clampScore,
  ensureScoreProfile,
  applyScoreChange,
};
