import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions, loadStripe } from "@stripe/stripe-js";
// import CheckoutForm from "./CheckoutForm";
import { FC } from "react";
import CheckoutForm from "./CheckoutForm";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface StripElementProviderProps {
  price: number;
}
const StripElementProvider: FC<StripElementProviderProps> = ({ price }) => {
  const options: StripeElementsOptions = {
    mode: "payment",
    amount: price * 100,
    currency: "usd",

    // Fully customizable with appearance API.
    appearance: {
      theme: "stripe",
    },
  };
  // return <div></div>;

  return (
    <Elements stripe={stripePromise} options={options}>
      {/* <Elements stripe={stripePromise}> */}
      <CheckoutForm price={price} />
    </Elements>
  );
};
export default StripElementProvider;
