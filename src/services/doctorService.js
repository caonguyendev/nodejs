import db from "../models/index";
require("dotenv").config();
import _ from "lodash";

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
let getTopDoctorHome = (limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limit,
        where: {
          roleId: "R2",
        },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
        ],
        raw: true,
        nest: true,
      });
      resolve({
        errCode: 0,
        data: users,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: {
          roleId: "R2",
        },
        attributes: {
          exclude: ["password", "image"],
        },
      });
      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let saveDetailInfoDoctor = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let arrDataIsConvertedToBoolean = [
        !data.doctorId,
        !data.contentHTML,
        !data.contentMarkdown,
        !data.selectedPrice,
        !data.selectedPayment,
        !data.selectedProvince,
        !data.nameClinic,
        !data.addressClinic,
        !data.note,
      ];
      if (arrDataIsConvertedToBoolean.some((item) => item === true)) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter!",
        });
      } else {
        // upsert to Markdown Table
        if (data.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: data.contentHTML,
            contentMarkdown: data.contentMarkdown,
            description: data.description,
            doctorId: data.doctorId,
          });
        } else if (data.action === "EDIT") {
          let doctor = await db.Markdown.findOne({
            where: {
              doctorId: data.doctorId,
            },
            raw: false,
          });
          doctor.contentHTML = data.contentHTML;
          doctor.contentMarkdown = data.contentMarkdown;
          doctor.description = data.description;
          await doctor.save();
        }

        //upsert to Doctor_Infor Table
        let doctorInfor = await db.Doctor_Infor.findOne({
          where: {
            doctorId: data.doctorId,
          },
          raw: false,
        });
        if (doctorInfor) {
          // update
          doctorInfor.priceId = data.selectedPrice;
          doctorInfor.paymentId = data.selectedPayment;
          doctorInfor.provinceId = data.selectedProvince;
          doctorInfor.nameClinic = data.nameClinic;
          doctorInfor.addressClinic = data.addressClinic;
          doctorInfor.note = data.note;
          await doctorInfor.save();
        } else {
          // create
          await db.Doctor_Infor.create({
            doctorId: data.doctorId,
            priceId: data.selectedPrice,
            paymentId: data.selectedPayment,
            provinceId: data.selectedProvince,
            nameClinic: data.nameClinic,
            addressClinic: data.addressClinic,
            note: data.note,
          });
        }
        resolve({
          errCode: 0,
          errMessage: "Save info doctor succeed!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getDetailDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        let data = await db.User.findOne({
          where: {
            id: inputId,
            roleId: "R2",
          },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["contentHTML", "contentMarkdown", "description"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });
        if (data && data.image) {
          data.image = new Buffer(data.image, "base64").toString("binary");
        }
        if (!data) {
          resolve({
            errCode: 2,
            errMessage: "User not found!",
          });
        } else {
          resolve({
            errCode: 0,
            data: data,
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let bulkCreateScheduleService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else if (data && data.length > 0) {
        // loop array object and ađd maxNumber atrributes
        data = data.map((item) => {
          item.maxNumber = MAX_NUMBER_SCHEDULE;
          return item;
        });
      }
      // get all schedule of doctor on a particular day
      let existing = await db.Schedule.findAll({
        where: {
          doctorId: data[0].doctorId,
          date: data[0].date,
        },
        attributes: ["timeType", "date", "doctorId", "maxNumber"],
      });
      // compare and return array object date and timeType that do not match
      let toCreate = _.differenceWith(data, existing, (a, b) => {
        return a.timeType === b.timeType && a.date === b.date;
      });
      console.log(toCreate);
      // Data don't exist in database is inserted
      if (toCreate && toCreate.length > 0) {
        await db.Schedule.bulkCreate(toCreate);
      }

      resolve({
        errCode: 0,
        message: "Save doctor schedule succeed!",
      });
    } catch (error) {
      reject(error);
    }
  });
};

let getScheduleByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({ errCode: 1, errMessage: "Missing required parameter!" });
      } else {
        let dataSchedule = await db.Schedule.findAll({
          where: {
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.Allcode,
              as: "timeData",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!dataSchedule) {
          dataSchedule = [];
        }
        resolve({
          errCode: 0,
          data: dataSchedule,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getExtraInforDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        let data = await db.Doctor_Infor.findOne({
          where: {
            doctorId: doctorId,
          },
          atributes: {
            exclude: ["id", "doctorId"],
          },
          include: [
            {
              model: db.Allcode,
              as: "priceData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "paymentData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "provinceData",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        resolve({
          errCode: 0,
          message: "Ok",
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getTopDoctorHome,
  getAllDoctors,
  saveDetailInfoDoctor,
  getDetailDoctorById,
  bulkCreateScheduleService,
  getScheduleByDate,
  getExtraInforDoctorById,
};
