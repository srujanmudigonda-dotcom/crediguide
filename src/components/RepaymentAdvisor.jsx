
import { useEffect, useState } from "react";
import advisorService from "../services/advisorService";

function RepaymentAdvisor() {
  const [advice, setAdvice] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdvice = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await advisorService.getRepaymentAdvice();

      if (response.success) {
        setAdvice(response.advice || []);
        setSummary(response.summary || "");
      } else {
        setError(
          response.message || "Unable to load repayment advice."
        );
      }
    } catch (err) {
      console.error("Repayment Advisor Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load repayment advice."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvice();
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-800">
          Personalized Repayment Advisor
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Personalized guidance based on your loans and payment behavior.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">
          Analyzing your repayment information...
        </p>
      )}

      {!loading && error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {summary && (
            <p className="mb-4 text-sm text-gray-600">
              {summary}
            </p>
          )}

          <div className="space-y-3">
            {advice.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <p className="text-sm leading-6 text-gray-700">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default RepaymentAdvisor;
