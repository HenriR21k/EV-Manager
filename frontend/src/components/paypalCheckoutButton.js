import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import configuration from "../config/configuration";

const PaypalCheckoutButton = (props) => {
  const { product, payeeEmail, merchantId } = props;

  console.log("paytest", product, payeeEmail, merchantId);

  return (
    <PayPalScriptProvider
      options={{
        clientId: "AfwlgYBcXmhIReg_CiCYMHZjuaZKwn8uUnOWBtFs5yO3drQAwC70a3VvQQoNcF7w2pGsceRrRzgujsBV",
        merchantId: configuration.merchantId
      }}
    >
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: product.price.toFixed(2),
                  currency_code: "USD",
                },
                payee: {
                  email_address: payeeEmail,
                },
                description: product.description,
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            console.log("Transaction completed by", details);
          });
        }}
        onError={(err) => {
          console.error("PayPal Checkout Error:", err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PaypalCheckoutButton;
