import React, { useRef, useState } from "react";

import "./drop-file-input.css";
import { ImageConfig } from "../../config/ImageConfig";
import uploadImg from "../../assets/upload.png";
import api from "../../services/api";
import { MdLink, MdCheckCircle, MdError } from "react-icons/md";
import fileSize from "filesize";
import { uniqueId } from "lodash";
import { CircularProgressbar } from "react-circular-progressbar";

const DropFileInput = (props) => {
  const wrapperRef = useRef(null);
  const [fileList, setFileList] = useState([]);
  const [message, setMessage] = useState("Arraste seus arquivos (3 MB)");
  const onDragEnter = (e) => {
    setMessage("Solte seus arquivos aqui :)");
    wrapperRef.current.classList.add("dragover");
  };
  const onDragLeave = () => {
    wrapperRef.current.classList.remove("dragover");
    setMessage("Arraste seus arquivos (3 MB)");
  };
  const onDrop = () => {
    setMessage("Arraste seus arquivos (3 MB)");
    wrapperRef.current.classList.remove("dragover");
  };

  const onFileDrop = (e) => {
    const newFile = [...e.target.files];

    if (newFile) {
      const updateList = [...fileList, ...newFile];
      console.log("antes de mudar o obj", updateList);
      const arquivos = updateList.map((item) => {
        if (item.item) return item;
        return {
          item,
          id: uniqueId(),
          progress: 0,
          uploaded: false,
          error: false,
          url: null,
          extensionValid: true,
          sizeValid: true,
        };
      });
      setFileList(arquivos);
      processUpload(arquivos);
      props.onFileChange(fileList);
    }
  };

  const validationFile = (archive) => {
    const extensionPDF = "application/pdf";
    const maxSize = 3 * 1024 * 1024;

    //Verificando se existe alguma inconformidade;
    if (archive.item.type !== extensionPDF || archive.item.size > maxSize) {
      //verificando extensao
      if (archive.item.type !== extensionPDF) {
        setFileList((arr) =>
          arr.map((file) => {
            return file.id === archive.id
              ? { ...file, error: true, extensionValid: false }
              : file;
          })
        );
      }
      // verificando tamanho do arquivo
      if (archive.item.size > maxSize) {
        setFileList((arr) =>
          arr.map((file) => {
            return file.id === archive.id
              ? { ...file, error: true, sizeValid: false }
              : file;
          })
        );
      }

      return false;
    }

    return true;
  };

  const processUpload = (archives) => {
    archives.map((archive) => {
      const data = new FormData();
      data.append("file", archive.item);

      if (validationFile(archive)) {
        api
          .post("/arquivo", data, {
            onUploadProgress: (e) => {
              const progress = parseInt(Math.round((e.loaded * 100) / e.total));
              setFileList((arr) =>
                arr.map((file) => {
                  // const uploaded = progress === 100 ? true : false;
                  return file.id === archive.id ? { ...file, progress } : file;
                })
              );
            },
          })
          .then((resp) => {
            setFileList((arr) =>
              arr.map((file) => {
                return file.id === archive.id
                  ? {
                      ...file,
                      uploaded: true,
                      id: resp.data._id,
                      url: resp.data.url,
                    }
                  : file;
              })
            );
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };

  const fileRemove = (file) => {
    const updatedList = [...fileList];
    updatedList.splice(fileList.indexOf(file), 1);
    setFileList(updatedList);
  };

  return (
    <>
      <div
        ref={wrapperRef}
        className="drop-file-input"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="drop-file-input__label">
          <img src={uploadImg} alt="" />
          <p>{message}</p>
          <span>Mereço um aumento ;)</span>
        </div>
        <input type="file" value="" onChange={onFileDrop} multiple />
      </div>

      {fileList.length > 0 ? (
        <div className="drop-file-preview">
          <p className="drop-file-preview__title">Vizualize seus uploads</p>
          <div className="content_preview_file">
            {fileList.map((item, index) => (
              <div key={index} className="drop-file-preview__item">
                <div className="preview__item_info">
                  <img
                    src={
                      ImageConfig[item.item.type.split("/")[1]] ||
                      ImageConfig["default"]
                    }
                    alt=""
                  />
                  <div className="drop-file-preview__item__info">
                    <p>{item.item.name}</p>
                    {!item.extensionValid && (
                      <span className="file_invalid"> Extensão inválida</span>
                    )}
                    <p>
                      {fileSize(item.item.size)}
                      {!item.sizeValid && (
                        <span className="file_invalid">
                          {" "}
                          Arquivo muito grande
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {!item.uploaded && (
                  <CircularProgressbar
                    styles={{
                      root: { width: 24 },
                      path: { stroke: "#0F70CA" },
                    }}
                    strokeWidth={10}
                    value={item.progress}
                  />
                )}

                <div className="container_icons">
                  {item.uploaded && item.url && (
                    <a href={item.url} target={"_blank"}>
                      <MdLink size={28} color="#615c5c" />
                    </a>
                  )}
                  {item.error && <MdError size={28} color="#c03333" />}
                  {item.uploaded && !item.error && (
                    <MdCheckCircle size={28} color="#1eac65" />
                  )}
                  {item.uploaded && (
                    <span
                      className="drop-file-preview__item__del"
                      onClick={() => fileRemove(item)}
                    >
                      X
                    </span>
                  )}
                  {item.error && (
                    <span
                      className="drop-file-preview__item__del"
                      onClick={() => fileRemove(item)}
                    >
                      X
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default DropFileInput;
