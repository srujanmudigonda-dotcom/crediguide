import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/*
|--------------------------------------------------------------------------
| CrediGuide - Public Landing Page
|--------------------------------------------------------------------------
|
| The front door of the app. Explains what CrediGuide does and
| carries visitors to Login / Register. Everything behind login
| is unchanged.
|
*/

const FEATURES = [
  {
    icon: "📊",
    title: "Credit Score & Health",
    text: "Track your credit score over time and see a simple health view of where you stand, with your full score history in one place.",
  },
  {
    icon: "💳",
    title: "Loan & EMI Manager",
    text: "Keep every loan, EMI and payment in one list, record payments as you make them, and check the risk on upcoming EMIs before they bite.",
  },
  {
    icon: "🔔",
    title: "Smart Due-Date Reminders",
    text: "CrediGuide watches every due date and reminds you in the app and by SMS — well before the date, and even if a date slips past.",
  },
  {
    icon: "📄",
    title: "Credit Report Explainer",
    text: "Credit reports are hard to read. Paste the jargon and get a plain-language explanation of what it means for you.",
  },
  {
    icon: "🧭",
    title: "Repayment & Debt Guidance",
    text: "A personal improvement plan, a repayment advisor, a debt optimizer and a recovery planner help you decide what to pay, and when.",
  },
  {
    icon: "💬",
    title: "Budget Planner & Assistant",
    text: "Plan your month around your salary, test how a payment changes your score in the simulator, and ask the built-in assistant anytime.",
  },
];

const REMINDER_STEPS = [
  { label: "15 days before", detail: "First heads-up" },
  { label: "10 days before", detail: "Second reminder" },
  { label: "7 days to due date", detail: "Every single day" },
  { label: "Due date", detail: "Final call" },
  { label: "2 days after", detail: "Overdue alerts" },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Register & verify",
    text: "Create your account and verify your mobile number with the OTP we SMS you.",
  },
  {
    step: "2",
    title: "Add your loans",
    text: "Enter your credit score and your loans with their EMI due dates.",
  },
  {
    step: "3",
    title: "Never miss a date",
    text: "Get reminded before every due date and follow your improvement plan.",
  },
];

function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-2xl font-bold text-blue-600">
            CrediGuide
          </span>

          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2.5 font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Know your credit.
              <br />
              Pay on time.
              <br />
              Grow your score.
            </h1>

            <p className="mt-5 max-w-lg text-lg text-blue-100">
              CrediGuide keeps your credit score, loans and EMI due
              dates in one place — and reminds you by SMS before a
              payment is due, so a missed date never hurts your score.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Create free account
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Login
              </Link>
            </div>

            <p className="mt-4 text-sm text-blue-200">
              Registration is verified with a one-time password sent
              to your mobile number.
            </p>
          </div>

          {/* Preview card (illustration of the dashboard) */}
          <div className="rounded-2xl bg-white p-6 text-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Credit Score
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Good health
              </span>
            </div>

            <div className="mt-2 text-5xl font-bold text-slate-900">
              742
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-green-500" />
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm">
                  🏠 Home loan EMI · ₹12,450
                </span>
                <span className="text-xs font-semibold text-amber-600">
                  Due in 3 days
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm">
                  💳 Credit card bill · ₹8,200
                </span>
                <span className="text-xs font-semibold text-green-600">
                  Reminder set
                </span>
              </div>
              <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                🔔 Next SMS reminder goes out automatically —
                15, 10 and 7 days before every due date.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Features                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-slate-900">
          Everything about your credit, in one guide
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-500">
          No spreadsheets, no missed dates, no confusing reports.
          CrediGuide watches the numbers so you don't have to.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Reminder pattern                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Reminders that start early — and don't give up
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-500">
            Every loan with reminders on follows the same pattern,
            in the app and by SMS:
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {REMINDER_STEPS.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center"
              >
                <div className="font-bold text-blue-700">
                  {item.label}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-slate-900">
          Start in three steps
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-blue-600 px-6 py-10 text-center text-white">
          <h3 className="text-2xl font-bold">
            Your next due date is coming. Be ready for it.
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-blue-100">
            Create your account, add your loans, and let CrediGuide
            keep watch from there.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Register now
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                           */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="text-xl font-bold text-blue-600">
            CrediGuide
          </div>
          <p className="mt-2 text-sm text-slate-500">
            A credit health companion — track your score, manage your
            loans, and never miss a due date.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Credit scores shown in CrediGuide are simulated for
            learning and guidance, and are not a bureau score.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
