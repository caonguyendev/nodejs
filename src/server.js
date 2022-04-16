import express from "express";
// Giúp server lấy giá trị tham số trên url
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRouters from "./route/web";
import connectDB from "./config/connectDB";
require("dotenv").config();

// Create express app
let app = express();

// enable cors
// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

// config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
viewEngine(app);
// Khai báo cho Express biết url nào đang được truy cập
// từ đó vào file web.js tìm và trả về kết quả phù hợp
initWebRouters(app);

connectDB();

// Lấy tham số PORT ở file .env
let port = process.env.PORT || 6789;
app.listen(port, () => {
  console.log("Backend Nodejs in running on the port: " + port);
});
