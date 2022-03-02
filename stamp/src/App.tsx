import React from "react";

const App = () => {
  return (
    <div>
      <h1 style={{ color: "red" }}>Hello, world!</h1>
    </div>
  );
};

export default App;

export const countLengthOfApp = () => {
  return App.toString().length;
};
