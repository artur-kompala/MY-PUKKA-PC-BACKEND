const Cpu = require("../db/models/cpu");
const Product = require("../db/models/product");
const sdk = require("api")("@priceapi/v2#5p92b2flo464cum");

class ProductActions {
  async getProduct(req, res) {
    const name = req.body.name;
    console.log(name);
    try {
      await Product.find({ name: name }).then((doc) =>
        res.status(200).json(doc)
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async updateProduct() {
    const job_id = [];
    console.log("kurwa");
    try {
      const cpuGid = await Cpu.find(
        {},
        { _id: 0, gid: 1, name: 1, manufacture: 1 }
      );
      cpuGid.map((item) => {
        const gid = item.gid;
        const name = item.name;
        const manufacture = item.manufacture;

        const full = manufacture + " " + name;
        console.log(full);

        sdk.auth(process.env.API_KEY);
        sdk
          .jobsPost({
            source: "google_shopping",
            country: "pl",
            topic: "product_and_offers",
            key: "id",
            values: gid,
          })
          .then(({ data }) => this.checkStatus(data.job_id, full))
          .catch((err) => console.error(err));
      });
      //
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async downloadJob(job, name) {
    const sdk = require("api")("@priceapi/v1#24lew4kq6sho71");
    console.log("Pobieram" + name);
    sdk.auth(
      "IAXNPAOJBGCIUPLAHMODSRHKNJVXFEBBYEJJPAHDYIFAFTBBHIFUMFRVZUBSTBZZ"
    );
    sdk
      .getJobResults({ job_id: job })
      .then(({ data }) => {
        const priceCheck = data.results[0].content.offers
        const lowestPrice = priceCheck.reduce((min,current)=>{
          return current.price < min ? current.price : min;
        }, priceCheck[0]);

        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        console.log(lowestPrice);
        const filter = { name: name };
        const update = {
          $set: { name: name, data: data },
          $push: { date: `${day}.${month}.${year}`,price: lowestPrice},
        };
        const options = { upsert: true };

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
      })
      .catch((err) => console.error(err));
  }
  async checkStatus(job, name) {
    const sdk = require("api")("@priceapi/v1#24lew4kq6sho71");
    console.log("Sprawdzam staus" + name);
    sdk.auth(
      "IAXNPAOJBGCIUPLAHMODSRHKNJVXFEBBYEJJPAHDYIFAFTBBHIFUMFRVZUBSTBZZ"
    );
    sdk
      .getJobStatus({ job_id: job })
      .then(({ data }) => {
        if (data.status === "finished") {
          this.downloadJob(data.job_id, name);
        } else {
          setTimeout(() => this.checkStatus(job, name), 2000);
        }
      })
      .catch((err) => console.error(err));
  }
}
module.exports = new ProductActions();
