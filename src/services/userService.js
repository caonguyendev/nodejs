import db from "../models/index";
import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(email);
      if (isExist) {
        let user = await db.User.findOne({
          where: { email: email },
        });
        if (user) {
          let check = await bcrypt.compareSync(password, user.password);
          console.log(password, user.password);
          if (check) {
            userData.errCode = 0;
            userData.errMessage = "Ok";
            userData.user = user;
          } else {
            userData.errCode = 3;
            userData.errMessage = "Wrong Password";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = `User's not found!`;
        }
      } else {
        // return error
        userData.errCode = 1;
        userData.errMessage = `Your's Email isn't in your system. Plz try other email!`;
      }
      resolve(userData);
    } catch (error) {
      reject(error);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({ where: { email: userEmail } });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      if (userId === "ALL") {
        users = await db.User.findAll({
          attributes: {
            exclude: ["password"],
          },
        });
      }
      if (userId && userId !== "ALL") {
        users = await db.User.findOne({
          where: { id: userId },
          attributes: {
            exclude: ["password"],
          },
        });
      }
      // if (users) {
      //   console.log(users);
      // }
      resolve(users);
    } catch (error) {
      reject(error);
    }
  });
};

let createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // check email is exist ??
      let check = await checkUserEmail(data.email);
      if (check) {
        resolve({
          errCode: 1,
          errMessage: "Your email already in used, Pls try another email!",
        });
      } else {
        let hasPasswordFromBcrypt = await hashUserPassword(data.password);
        await db.User.create({
          email: data.email,
          password: hasPasswordFromBcrypt,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phonenumber: data.phonenumber,
          gender: data.gender,
          roleId: data.roleId,
        });
        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      var hashPassword = await bcrypt.hashSync("B4c0//", salt);
      resolve(hashPassword);
    } catch (error) {
      reject(error);
    }
  });
};

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // check user exists ??
      let user = await db.User.findOne({
        where: { id: userId },
        raw: false,
      });
      if (!user) {
        return resolve({
          errCode: 2,
          errMessage: `The user isn't exist`,
        });
      }
      await user.destroy();
      resolve({
        errCode: 0,
        message: "The user has been deleted",
      });
    } catch (error) {
      reject(error);
    }
  });
};

let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        return resolve({
          errCode: 2,
          errMessage: "Missing required parameter!",
        });
      }
      let user = await db.User.findOne({
        where: {
          id: data.id,
        },
        raw: false,
      });
      if (user) {
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;
        await user.save();
        resolve({
          errCode: 0,
          message: "Update the user succeed!",
        });
      } else {
        resolve({
          errCode: 1,
          message: "User's not found!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  handleUserLogin: handleUserLogin,
  getAllUsers: getAllUsers,
  createNewUser: createNewUser,
  updateUserData: updateUserData,
  deleteUser: deleteUser,
};
