const User = require("../db/models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Case = require("../db/models/case");
const CpuCooler = require("../db/models/cpuCooler");
const Mobo = require("../db/models/mobo");
const Gpu = require("../db/models/gpu");
const Memory = require("../db/models/memory");
const Psu = require("../db/models/psu");
const Fan = require("../db/models/fan");
const Storage = require("../db/models/storage");
const Os = require("../db/models/os");
const Cpu = require("../db/models/cpu");
const csv = require("csv-parser");
const fs = require("fs");
const stream = require("stream");
const { log } = require("console");

class UserActions {
  constructor() {
    this.addGpuRank = this.addGpuRank.bind(this);
    this.updateBenchmark = this.updateBenchmark.bind(this);
  }
  async registerUser(req, res) {
    try {
      const data = {
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
      };
      console.log(req.body.fullName);
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        return res.status(406).send("Użytkownik już istnieje");
      } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;
        const userdata = await User.insertMany(data);
        return res
          .status(200)
          .json({ message: "Użytkownik został zarejestrowany" });
      }
    } catch (error) {
      return res.status(500).send("Błędne dane");
    }
  }
  async loginUser(req, res) {
    try {
      const check = await User.findOne({ email: req.body.email });
      if (!check) {
        return res.status(401).json({
          error: "User not found",
          message: "User with provided email not found.",
        });
      }
      const isPasswordMatch = await bcrypt.compare(
        req.body.password,
        check.password
      );
      if (!isPasswordMatch) {
        return res
          .status(401)
          .json({ error: "Unauthorized", message: "Incorrect password." });
      } else {
        const token = jwt.sign({ userId: check._id }, process.env.SECRET_KEY, {
          expiresIn: "1h",
        });
        return res.status(200).json({
          session: { token },
          user: {
            role: "authenticated",
            user_metadata: {
              fullName: check.fullName,
              email: check.email,
              admin: check.admin,
            },
          },
        });
      }
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }
  }
  async verifyUser(req, res) {
    const token = req.body.token;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "Token not provided." });
    }
    jwt.verify(token, process.env.SECRET_KEY, (err) => {
      if (err) {
        return res
          .status(401)
          .json({ error: "Unauthorized", message: "Invalid token." });
      } else {
        return res
          .status(200)
          .json({ message: "Token is valid.", user: req.body.user });
      }
    });
  }
  async addCart(req, res) {
    const { user } = req.query;
    const data = req.body;

    try {
      await User.updateOne(
        { fullName: user },
        { $set: { [`cart.${data.type}`]: data.data } },
        { upsert: true }
      );
      res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async getCart(req, res) {
    const { user } = req.query;
    try {
      const data = await User.find({ fullName: user }, { cart: 1, _id: 0 });
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async deleteItemCart(req, res) {
    const { user, item } = req.query;
    console.log(user);
    console.log(item);
    try {
      const data = await User.updateMany(
        { fullName: user },
        { $unset: { [`cart.${item}`]: "" } }
      );
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async updateDatabase(req, res) {
    const { collection, data } = req.body;
    try {
      switch (collection) {
        case "cpu":
          await Cpu.insertMany([data]);
          break;
        case "cooler":
          await CpuCooler.insertMany([data]);
          break;
        case "mobo":
          await Mobo.insertMany([data]);
          break;
        case "gpu":
          await Gpu.insertMany([data]);
          break;
        case "memory":
          await Memory.insertMany([data]);
          break;
        case "psu":
          await Psu.insertMany([data]);
          break;
        case "case":
          await Case.insertMany([data]);
          break;
        case "fan":
          await Fan.insertMany([data]);
          break;
        case "storage":
          await Storage.insertMany([data]);
          break;
        case "os":
          await Os.insertMany([data]);
          break;
        default:
          return res
            .status(400)
            .send({ message: "Invalid collection specified." });
      }
      res.status(200).send({ message: "Data inserted successfully." });
    } catch (error) {
      res
        .status(500)
        .send({ message: "An error occurred.", error: error.message });
    }
  }
  async addGpuRank() {
    const docs = await Gpu.find({}, { _id: 1 }).sort({ score: -1 });

    const bulkOps = docs.map((doc, index) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { rank: index + 1 } },
      },
    }));

    if (bulkOps.length > 0) {
      await Gpu.bulkWrite(bulkOps);
    }
  }
  async updateBenchmark(req, res) {
    const { collection } = req.body;
    const file = req.file;

    if (file) {
      if (file && collection === "gpu") {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);

        const parser = bufferStream.pipe(csv());

        const operations = [];

        for await (const row of parser) {
          const newValues = {
            $set: {
              score: parseInt(row.Benchmark),
              samples: parseInt(row.Samples),
            },
          };

          operations.push({
            updateOne: {
              filter: { chipset: row.Model },
              update: newValues,
              upsert: false,
            },
          });
        }

        if (operations.length > 0) {
          await Gpu.bulkWrite(operations);
          await this.addGpuRank();
          return res.status(200).send({ message: "Benchmark update" });
        }
      }
    } else {
      return res.status(400).send({ message: "File not sent" });
    }
  }
  async deleteProduct(req, res) {
    const { collection, gid } = req.body;
    try {
      let deleteResult;
      switch (collection) {
        case "cpu":
          deleteResult = await Cpu.deleteOne({ gid: gid });
          break;
        case "cooler":
          deleteResult = await CpuCooler.deleteOne({ gid: gid });
          break;
        case "mobo":
          deleteResult = await Mobo.deleteOne({ gid: gid });
          break;
        case "gpu":
          deleteResult = await Gpu.deleteOne({ gid: gid });
          break;
        case "memory":
          deleteResult = await Memory.deleteOne({ gid: gid });
          break;
        case "psu":
          deleteResult = await Psu.deleteOne({ gid: gid });
          break;
        case "case":
          deleteResult = await Case.deleteOne({ gid: gid });
          break;
        case "fan":
          deleteResult = await Fan.deleteOne({ gid: gid });
          break;
        case "storage":
          deleteResult = await Storage.deleteOne({ gid: gid });
          break;
        case "os":
          deleteResult = await Os.deleteOne({ gid: gid });
          break;
        default:
          return res
            .status(400)
            .send({ message: "Invalid collection specified." });
      }

      if (deleteResult && deleteResult.deletedCount === 0) {
        return res.status(400).send({ message: "No product found to delete." });
      }

      res.status(200).send({ message: "Product deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .send({ message: "An error occurred", error: error.message });
    }
  }
  async updateUser(req, res) {
    const { password, user, fullName } = req.query;   
    try {
      if (password && user && password !== "undefined") {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const updatedUser = await User.findOneAndUpdate(
          { email: user },
          { $set: { password: hashedPassword } }
        );
      }
      if (fullName && user && fullName !== "undefined") {
        const updatedUser = await User.findOneAndUpdate(
          { email: user },
          { $set: { fullName: fullName } }
        );
      }
      const check = await User.findOne({ email: user });
      const token = jwt.sign({ userId: check._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        session: { token },
        user: {
          role: "authenticated",
          user_metadata: {
            fullName: check.fullName,
            email: check.email,
            admin: check.admin,
          },
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal Server Error");
    }
  }
}
module.exports = new UserActions();
