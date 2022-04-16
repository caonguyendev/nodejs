import express from "express";

let configViewEngine = (app) => {
  // Sau này muốn lấy ảnh trên server thì ta sẽ
  // nói vs Express rằng chỉ được lấy ảnh trên thư mục này
  app.use(express.static("./src/public"));
  // Define view engine EJS
  app.set("view engine", "ejs");
  // Set đường link lấy ejs
  app.set("views", "./src/views");
};

module.exports = configViewEngine;
