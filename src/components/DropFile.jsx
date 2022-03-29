import React from "react";
import DropFileInput from "./drop-file-input/DropFileInput";
import logo from "../assets/logo.png";

const DropFile = () => {
  return (
    <div className="box">
      <img src={logo} width={90} />
      <DropFileInput onFileChange={(files) => onFileChange(files)} />
    </div>
  );
};

export default DropFile;
