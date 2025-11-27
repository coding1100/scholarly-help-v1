import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useEffect, useState } from "react";

type CheckoutFormProps = {
  price: number;
};

const CheckoutForm: FC<CheckoutFormProps> = ({ price }) => {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [paymentErr, setPaymentErr] = useState<any>("");
  // const location = useLocation();
  const navigate = useRouter();
  useEffect(() => {
    let timeout: any = null;
    if (paymentErr) {
      timeout = setTimeout(() => {
        setPaymentErr("");
      }, 5000);
    }

    return () => clearTimeout(timeout);
  }, [paymentErr]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // let url = `${
    //   import.meta.env.VITE_APP_URL
    // }/pay-for-someone-to-write-my-paper`;

    // localStorage.setItem("redirectFromThankYouPage", url);

    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    const fd = new FormData();
    fd.append("amount", String(price * 100));

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEW_API_URL}/create-payment-intent.php`,
        fd
      );

      if (res?.data?.status === 400) {
        setLoading(false);
        setPaymentErr("Something went wrong please try again.");
        return;
      }

      elements.submit();

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: res.data.data,
        confirmParams: {
          return_url: `${window.location.origin}/thank-you-3`,
        },
        redirect: "if_required",
      });

      if (paymentIntent && paymentIntent.status === "succeeded") {
        localStorage.setItem("price_order", String(price));
        navigate.push("/thank-you-3");
      }
      setPaymentErr(error?.message);
      // console.log(error, "check error");
    } catch (error) {
      // console.log(error, "check error in catch");
      setLoading(false);
    }

    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {paymentErr && <div className="text-danger">{paymentErr}</div>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="bg-primary-400 text-white w-full rounded-full py-4 mt-3"
      >
        {loading ? "Loading" : "Submit"}
      </button>
    </form>
  );
};

export default CheckoutForm;
