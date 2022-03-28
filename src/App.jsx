import { useState } from "react";

import "./App.css";
import DropFileInput from "./components/drop-file-input/DropFileInput";
import logo from "./assets/logo.png";

function App() {
  const onFileChange = (files) => {
    console.log(files);
  };

  return (
    <div className="box">
      <img src={logo} width={90} />
      <DropFileInput onFileChange={(files) => onFileChange(files)} />
    </div>
  );
}

export default App;
