import { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User, sendEmailVerification } from "firebase/auth";

interface UserDetails {
  photo: string;
  firstName: string;
  email: string;
  lastName?: string;
}

function Profile() {
  const [isVerified, setIsVerified] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user: User | null) => {
      if (!user || !user.uid) {
        console.log("User not logged in");
        window.location.href = "/login";
        return;
      }
      try {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data() as UserDetails);
          console.log(docSnap.data());
        } else {
          console.log("User is not logged in");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    });
  };

  const verifyEmailStatus = () => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setIsVerified(user.emailVerified);
      }
    });
  };
  useEffect(() => {
    fetchUserData();
    verifyEmailStatus();
  }, []);

  async function handleSendVerification() {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        setVerificationSent(true);
      } catch (error: any) {
        console.error("Error sending verification email: ", error.message);
      }
    }
  }

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User logged out successfully!");
    } catch (error: any) {
      console.error("Error logging out:", error.message);
    }
  }
  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        {userDetails ? (
          <>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src={userDetails.photo}
                width={"40%"}
                style={{ borderRadius: "50%" }}
              />
            </div>
            <h3>Welcome {userDetails.firstName} 🙏🙏</h3>
            <div>
              <p>Email: {userDetails.email}</p>
              <p>First Name: {userDetails.firstName}</p>
              {/* <p>Last Name: {userDetails.lastName}</p> */}
            </div>
            <div className="mb-3">
              {isVerified ? (
                <p style={{ color: "green" }}>Your account is verified!</p>
              ) : (
                <>
                  <p style={{ color: "red" }}>
                    Your account is not verified. Please check your email.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={handleSendVerification}
                    disabled={verificationSent} // Disable button after sending
                  >
                    {verificationSent
                      ? "Verification Email Sent"
                      : "Send Verification Email"}
                  </button>
                </>
              )}
            </div>
            <button className="btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
export default Profile;
