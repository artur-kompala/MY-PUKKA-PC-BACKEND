const Case = require("../db/models/case");
const Cpu = require("../db/models/cpu");
const CpuCooler = require("../db/models/cpuCooler");
const Fan = require("../db/models/fan");
const Gpu = require("../db/models/gpu");
const Memory = require("../db/models/memory");
const Mobo = require("../db/models/mobo");
const Os = require("../db/models/os");
const Product = require("../db/models/product");
const Psu = require("../db/models/psu");
const Storage = require("../db/models/storage");
const sdk = require("api")("@priceapi/v2#5p92b2flo464cum");
const options = { upsert: true };
require('dotenv').config()

class ProductActions {
  async getProduct(req, res) {
    const { gid, last } = req.query;
    try {
      await Product.find({ gid }, { chart: { $slice: -last } }).then((doc) => {
        res.status(200).json(doc);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async updateProduct() {
    const job_id = [];
    try {
      const [
        cases,
        cpus,
        cpuCoolers,
        fans,
        gpus,
        memories,
        mobos,
        os,
        psus,
        storages,
      ] = await Promise.all([
        Case.find({}, { _id: 0, gid: 1}),
        Cpu.find({}, { _id: 0, gid: 1}),
        CpuCooler.find({}, { _id: 0, gid: 1}),
        Fan.find({}, { _id: 0, gid: 1}),
        Gpu.find({}, { _id: 0, gid: 1}),
        Memory.find({}, { _id: 0, gid: 1}),
        Mobo.find({}, { _id: 0, gid: 1}),
        Os.find({}, { _id: 0, gid: 1}),
        Psu.find({}, { _id: 0, gid: 1}),
        Storage.find({}, { _id: 0, gid: 1}),
      ]);

      const allObjects = [
        ...cases,
        ...cpus,
        ...cpuCoolers,
        ...fans,
        ...gpus,
        ...memories,
        ...mobos,
        ...os,
        ...psus,
        ...storages,
      ];
      allObjects.map((item) => {
        const gid = item.gid;

        sdk.auth(process.env.API_KEY);
        sdk
          .jobsPost({
            source: "google_shopping",
            country: "pl",
            topic: "product_and_offers",
            key: "id",
            values: gid,
          })
          .then(({ data }) => this.checkStatus(data.job_id, gid))
          .catch((err) => console.error(err));
      });
      //
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async downloadJob(job, gid) {
    const today = new Date();
    const filter = { gid: gid };
    const sdk = require("api")("@priceapi/v1#24lew4kq6sho71");
    console.log("Pobieram" + gid);
    sdk.auth(
      process.env.API_KEY
    );
    sdk
      .getJobResults({ job_id: job })
      .then(({ data }) => {
        const priceCheck = data.results[0]?.content?.offers;

        if (priceCheck && priceCheck.length > 0) {
          const lowestPrice = priceCheck.reduce((min, current) => {
            return current.price < min ? current.price : min;
          }, priceCheck[0]);

          const update = {
            $set: { gid: gid, data: data },
            $push: { chart: { date: today, price: lowestPrice } },
          };

          Product.updateOne(filter, update, options)
            .then((result) => {
              console.log("Aktualizacja zakończona pomyślnie");
             
            })
            .catch((error) => {
              console.error(
                "Wystąpił błąd podczas aktualizacji dokumentu:",
                error
              );
            });
        } else {
          const update = {
            $set: { gid: gid, data: data },
            $push: { chart: { date: today, price: null } },
          };

          Product.updateOne(filter, update, options)
            .then((result) => {
              console.log("Aktualizacja zakończona pomyślnie");
             
            })
            .catch((error) => {
              console.error(
                "Wystąpił błąd podczas aktualizacji dokumentu:",
                error
              );
            });
        }
      })
      .catch((err) => console.error(err));
  }
  async checkStatus(job, gid) {
    const sdk = require("api")("@priceapi/v1#24lew4kq6sho71");
    console.log("Sprawdzam staus" + gid);
    sdk.auth(
      process.env.API_KEY
    );
    sdk
      .getJobStatus({ job_id: job })
      .then(({ data }) => {
        if (data.status === "finished") {
          this.downloadJob(data.job_id, gid);
        } else {
          setTimeout(() => this.checkStatus(job, gid), 2000);
        }
      })
      .catch((err) => console.error(err));
  }
  async getPrice() {
    try {
      const productPrice = await Product.find({}, { _id: 0, gid: 1, chart: 1 });

      const updatePromises = productPrice.map(async (item) => {
          const query = { gid: item.gid };
          const newValues = { $set: { price: item.chart.at(-1).price } };

          const updateOperations = [
              Cpu.updateOne(query, newValues, {upsert: false}),
              CpuCooler.updateOne(query, newValues, {upsert: false}),
              Fan.updateOne(query, newValues, {upsert: false}),
              Gpu.updateOne(query, newValues, {upsert: false}),
              Memory.updateOne(query, newValues, {upsert: false}),
              Mobo.updateOne(query, newValues, {upsert: false}),
              Os.updateOne(query, newValues, {upsert: false}),
              Psu.updateOne(query, newValues, {upsert: false}),
              Storage.updateOne(query, newValues, {upsert: false}),
              Case.updateOne(query, newValues, {upsert: false})
          ];

          return Promise.all(updateOperations)
              .then(() => console.log("Aktualizacja cen zakończona pomyślnie"))
              .catch((error) => console.error("Wystąpił błąd podczas aktualizacji cen", error));
      });

      await Promise.all(updatePromises);
  } catch (error) {
      console.error("Wystąpił błąd podczas pobierania danych", error);
  }
  }
}
module.exports = new ProductActions();
