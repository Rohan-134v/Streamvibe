import React from "react";
import "./styles.css"; // Ensure the CSS file is imported
import { Link } from "react-router-dom"


const OtherPage = () => {
  return (
    <div>
      <nav>
        <Link to="/home">Home</Link>
      </nav>
      <main>
        <h1>My other page</h1>
      </main>
    </div>
  );
};

export default OtherPage;