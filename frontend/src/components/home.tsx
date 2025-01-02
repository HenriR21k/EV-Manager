const Home = () => {
  return (
    <div className="home-container">
      <h1>Electric Vehicle Management System</h1>
      <p>Login to access functionality.<br></br>
      </p>
      <p>
        <span>The Manage tab</span> allows you to <span>add</span> an EV charging location. You will also be able to <span>reserve</span> a time period<br></br>
      </p>
      <p>
        <span>The Reservations tab</span> allows you to view your current and past reservations <br></br>
        Choosing one of your current reservations will take you to a <span>charging simulator</span> <br></br>
      </p>
      <p>
        After connecting and disconnecting from the charging simulator, you will be taken to the payment area <br></br>
        You will be charged based on the amount of energy taken multipled by <span>0.04</span>
      </p>
      <p>
        The charging stations chargest the fastest between the hours of <span>12PM - 6PM</span> (Afternoon)<br></br>
        They charge slower between <span>6AM - 12PM</span> (Morning), and then the slowest between <span>6PM - 6AM</span> (Night)
      </p>
    </div>
  );
};

export default Home;
