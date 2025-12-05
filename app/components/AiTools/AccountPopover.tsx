import { LuUser, LuLogOut } from "react-icons/lu";
import UsageAndPricing from "./UsageAndPricing";
import { useRouter } from "next/navigation";
import { FC } from "react";

interface AccountPopoverProps {
  setFlag: (value: boolean) => void;
  flag: boolean;
}

const AccountPopover: FC<AccountPopoverProps> = ({ setFlag, flag }) => {
  const router = useRouter();

  const handleLogout = () => {
    console.log("🔄 Starting logout - clearing localStorage...");
    // Clear all auth-related localStorage items
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("package_type");
    localStorage.removeItem("totalTokens");
    localStorage.removeItem("provider");
    localStorage.removeItem("profile_image");
    localStorage.removeItem("authState");
    localStorage.removeItem("user_password");
    localStorage.removeItem("authToken");
    localStorage.removeItem("localUserId");
    console.log("✅ Logout complete - localStorage cleared");
    router.push("/");
  };
  return (
    <div className="w-[220px] rounded-lg bg-white p-4 font-sans text-gray-800 ring-1 ring-gray-200">
      {/* Navigation Links */}
      <nav className="flex flex-col gap-3">
        {/* <a
          href="#"
          className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100"
        >
          <LuUser className="h-5 w-5 text-gray-600" />
          <span className="font-medium">Manage Account</span>
        </a> */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100"
        >
          <LuLogOut className="h-5 w-5 text-gray-600" />
          <span className="font-medium">Sign out</span>
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
