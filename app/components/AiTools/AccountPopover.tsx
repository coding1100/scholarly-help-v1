import { LuLogOut } from "react-icons/lu";
import UsageAndPricing from "./UsageAndPricing";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { clearAuthSession } from "@/app/utils/auth";
import ToolsApiLoader from "./ToolsApiLoader";

interface AccountPopoverProps {
  setFlag: (value: boolean) => void;
  flag: boolean;
}

const AccountPopover: FC<AccountPopoverProps> = ({ setFlag, flag }) => {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    clearAuthSession();
    router.push("/");
  };
  return (
    <div className="w-[220px] rounded-lg bg-white p-4 font-sans text-gray-800 ring-1 ring-gray-200">
      {/* Full-screen overlay while the session clears and the redirect runs. */}
      <ToolsApiLoader show={loggingOut} respectToolsSidebar={false} respectToolHeader={false} />
      {/* Navigation Links */}
      <nav className="flex flex-col gap-3">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LuLogOut className="h-5 w-5 text-gray-600" />
          <span className="font-medium">
            {loggingOut ? "Signing out…" : "Sign out"}
          </span>
        </button>
      </nav>

      {/* Divider */}
      <hr className="my-3 border-gray-200" />

      {/* Usage and Pricing Section */}
      <UsageAndPricing setFlag={setFlag} flag={flag} />
    </div>
  );
};

export default AccountPopover;
