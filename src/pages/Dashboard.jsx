import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import CreditScore from "../components/CreditScore";
import CreditHealth from "../components/CreditHealth";
import ScoreHistory from "../components/ScoreHistory";
import PaymentCard from "../components/PaymentCard";
import EMICard from "../components/EMICard";
import ImprovementPlanCard from "../components/ImprovementPlanCard";
import SalaryBudgetPlanner from "../components/SalaryBudgetPlanner";
import RepaymentAdvisor from "../components/RepaymentAdvisor";
import PaymentPrevention from "../components/PaymentPrevention";
import RecoveryPlanner from "../components/RecoveryPlanner";
import DebtOptimizer from "../components/DebtOptimizer";
import FinancialChatbot from "../components/FinancialChatbot";

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Credit Dashboard
              </h2>

              <p className="mt-2 text-gray-500">
                Track your simulated credit score, loan payments and
                credit health.
              </p>
            </div>

            {/* Credit Overview */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CreditScore />
              <CreditHealth />
            </div>

            {/* Score History */}
            <div className="mt-6">
              <ScoreHistory />
            </div>

            {/* Payments and EMI */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <PaymentCard />
              <EMICard />
            </div>

            {/* Improvement Plan */}
            <div className="mt-6">
              <ImprovementPlanCard />
            </div>

            {/* Salary & Budget Planner */}
            <div className="mt-6">
              <SalaryBudgetPlanner />
            </div>

            {/* Repayment Advisor */}
            <div className="mt-6">
              <RepaymentAdvisor />
            </div>

            {/* Payment Prevention */}
            <div className="mt-6">
              <PaymentPrevention />
            </div>

            {/* Recovery Planner */}
            <div className="mt-6">
              <RecoveryPlanner />
            </div>

            {/* Debt Optimizer */}
            <div className="mt-6">
              <DebtOptimizer />
            </div>

            {/* Financial Assistant */}
            <div className="mt-6">
              <FinancialChatbot />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;