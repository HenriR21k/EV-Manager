const Home = () => {
  return (
    <div className="home-container">
      <h1>Electric Vehicle Management System</h1>
      <p>Login to access functionality.<br></br>
        Manage tab: Allows you to create an EV charging location. You will also be able to create reservations.<br></br>
        Reservations tab: Allows you to view your current and past reservations. <br></br>
        Choosing one of your current reservations will take you to a charging simulator. <br></br>
        After connecting and disconnecting from the charging simulator, you will be taken to the payment area.
      </p>
    </div>
  );
};

export default Home;
