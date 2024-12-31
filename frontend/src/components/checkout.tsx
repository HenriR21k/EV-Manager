import { useLocation } from "react-router-dom";
import PaypalCheckoutButton from "./paypalCheckoutButton";
import useLoad from './api/useLoad';
import { API } from "./api/apiRequest";
import { useEffect } from "react";


const Checkout = () => {
    const location = useLocation();
    const state = location.state;
    
    
    const endpoint = `/user/${state.reservation.createdByuid}/Extra`
    const [extraUserDetails, setExtraUserDetails, loadingMessage1, loadExtraUserDetails] = useLoad(endpoint);
    console.log("State data:", state)
    console.log("Extra user details:", extraUserDetails)

    useEffect(() => {loadExtraUserDetails(endpoint)}, []);
    
        const product = {
          description: "Pay for energy",
          price: state.energyUsed*0.04
        };
    
        
    return (
      <div className="checkout-container">
        <div className="auth-wrapper">
            <div className="auth-inner">
            <h3>PayPal Checkout</h3>
            <div>
                {extraUserDetails ? (
                  <div>
                    <h1>payee email</h1>
                    <p>payee email {extraUserDetails.paypalEmail}</p>
                    <p>merchant id: {extraUserDetails.merchantId}</p>
                  </div>
                ) : (
                  <p>No user data available</p>
                )}
              </div>
            
            <p className="checkout-description">
            {"Owner of this EV Charger: "+state.reservation.createdByuid}
            </p>
            <p>User has used this amount of energy: {state.energyUsed}</p>
            <p>Current user id: {state.reservation.user}</p>
            <h3 className="checkout-price">£{state.energyUsed*0.04}p</h3>
              {/*Display button only if payer and payee emails are loaded */}  
            {extraUserDetails ? (
            <div className="paypal-button-container">
              <PaypalCheckoutButton 
              product={product}
              payeeEmail={extraUserDetails.paypalEmail}
              merchantId={extraUserDetails.merchantId}
              />
            </div>
            ) : (
              <p>No user data available</p>
            )}
            </div>
          </div>
        </div>
      
    );
  };

 
 export default Checkout;