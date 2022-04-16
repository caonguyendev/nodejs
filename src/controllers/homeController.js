import db from "../models/index";
import CRUDService from "../services/CRUDService";

let getHomePage = async (req, res) => {
  try {
    let data = await db.User.findAll();
    console.log("----------------");
    console.log(data);
    console.log("----------------");
    return res.render("homepage.ejs", {
      data: JSON.stringify(data),
    });
  } catch (error) {
    console.log(error);
  }
};

let getCRUD = (req, res) => {
  return res.render("crud.ejs");
};

let postCRUD = async (req, res) => {
  let message = await CRUDService.createNewUser(req.body);
  console.log(message);
  return res.send("post crud from server");
};

let displayAllCRUD = async (req, res) => {
  let data = await CRUDService.getAllUser();
  return res.render("displayCRUD.ejs", {
    data,
  });
};

let editCRUD = async (req, res) => {
  let userId = req.query.id;
  if (userId) {
    let userData = await CRUDService.getUserInfoById(userId);
    // check user data not found
    // if (userData) return res.send("Found a user");
    return res.render("editCRUD.ejs", {
      userData,
    });
  } else {
    return res.send("User not Found");
  }
};

let putCRUD = async (req, res) => {
  let data = req.body;
  await CRUDService.updateUserData(data);
  return res.redirect("/get-all");
};

let deleteCRUD = async (req, res) => {
  let id = req.query.id;
  if (id) {
    await CRUDService.deleteUserById(id);
    return res.send("Delete the user succeed!");
  } else {
    return res.send("User not found");
  }
};

module.exports = {
  getHomePage: getHomePage,
  getCRUD: getCRUD,
  postCRUD: postCRUD,
  displayAllCRUD: displayAllCRUD,
  editCRUD: editCRUD,
  putCRUD: putCRUD,
  deleteCRUD: deleteCRUD,
};
