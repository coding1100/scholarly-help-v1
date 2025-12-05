import React from "react";
import { useRouter } from "next/navigation";
import { FaRegClock, FaDatabase } from "react-icons/fa";
import axiosInstance from "@/app/axios";
import toast from "react-hot-toast";

interface PricingPlan {
  name: string;
  price: string;
  oldPrice?: string;
  duration: string;
  discount?: string;
  description?: string;
}

const plans: PricingPlan[] = [
  {
    name: "Yearly",
    price: "$9.58",
    oldPrice: "$11.98",
    duration: "Save 60%",
    discount: "60%",
  },
  {
    name: "Quarterly",
    price: "$16.00",
    oldPrice: "$20.00",
    duration: "Save 20%",
    discount: "20%",
  },
  {
    name: "Monthly",
    price: "$24.00",
    oldPrice: "$30.00",
    duration: "",
  },
];

const features = [
  {
    title: "Save 15-20 hours per paper",
    desc: "Focus on discovery and insights, not formatting",
    icon: <FaRegClock className="text-indigo-600 h-5 w-5 min-w-[20px]" />,
  },
  {
    title: "Limitless reference library storage",
    desc: "Transform scattered PDFs into a searchable knowledge base.",
    icon: <FaDatabase className="text-indigo-600 h-5 w-5 min-w-[20px]" />,
  },
];

const PricingPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [disabledPlans, setDisabledPlans] = React.useState<number[]>([]);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const totalTokens =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("totalTokens") || 0)
      : 0;

  React.useEffect(() => {
    const disabled: number[] = [];
    let defaultPlanIndex = 0; // Yearly by default

    if (totalTokens === 10000000) disabled.push(2); // Monthly
    if (totalTokens === 30000000) disabled.push(1); // Quarterly
    if (totalTokens === 1200000000) {
      disabled.push(0); // Yearly
      defaultPlanIndex = 1; // Select Quarterly if Yearly is already taken
    }

    setDisabledPlans(disabled);
    setSelectedPlan(defaultPlanIndex);
  }, [totalTokens]);

  const handlePlanClick = (idx: number) => {
    if (disabledPlans.includes(idx)) {
      if (idx === 2) toast.error("You already subscribed to the Monthly plan");
      if (idx === 1)
        toast.error("You already subscribed to the Quarterly plan");
      if (idx === 0) toast.error("You already subscribed to the Yearly plan");
      return;
    }
    setSelectedPlan(idx);
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    const planName = plans[selectedPlan].name.toLowerCase();
    try {
      if (!userId || !authToken) {
        console.error("Missing userId or authToken");
        return;
      }
      const payload = {
        user_id: userId,
        plan: planName,
      };

      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/v1/billing/create-checkout`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const redirectTo = response?.data?.url;
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (error) {
      console.error("Stripe checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
          Upgrade to Unlimited
        </h2>
        <ul className="mb-6 space-y-2 text-xs sm:text-sm">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1">{f.icon}</span>
              <div>
                <span className="font-semibold text-gray-800">{f.title}</span>
                <div className="text-gray-500 text-sm">{f.desc}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mb-6">
          {plans.map((plan, idx) => {
            const isDisabled = disabledPlans.includes(idx);
            return (
              <label
                key={plan.name}
                className={`flex items-center border rounded-lg px-4 py-2 mb-2 cursor-pointer transition-all ${
                  selectedPlan === idx
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 bg-white"
                } text-xs sm:text-sm ${
                  isDisabled ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onClick={() => handlePlanClick(idx)}
              >
                <input
                  type="radio"
                  name="plan"
                  checked={selectedPlan === idx}
                  disabled={isDisabled}
                  onChange={() => handlePlanClick(idx)}
                  className="form-radio accent-indigo-600 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{plan.name}</span>
                    {plan.duration && (
                      <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 rounded px-2 py-0.5 font-medium">
                        {plan.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {plan.oldPrice && (
                      <span className="text-gray-400 line-through text-xs">
                        {plan.oldPrice}
                      </span>
                    )}
                    <span className="text-base sm:text-lg font-bold text-indigo-700">
                      {plan.price}
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors mb-2 text-xs sm:text-sm ${
            isLoading ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Upgrade Now"
          )}
        </button>
        <div className="text-center text-[10px] sm:text-xs text-gray-500 mt-2">
          Join 37,102 researchers improving their writing with{" "}
          <span className="font-semibold">ScholarlyHelp</span>
        </div>
      </div>
    </div>
  );
};

export default PricingPopup;
