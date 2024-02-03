const Cpu = require("../db/models/cpu");
const Product = require("../db/models/product");
const sdk = require("api")("@priceapi/v2#5p92b2flo464cum");
const options = { upsert: true };

class ProductActions {
  async getProduct(req, res) {
    
    const {name,last} = req.query;
    try {
      await Product.find({name},{chart: {$slice: -last}}).then((doc) =>{
        res.status(200).json(doc)
      }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async updateProduct() {
    const job_id = [];
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
        const filter = { name: name };
        const update = {
          $set: { name: name, data: data },
          $push: { chart: {date: today,price: lowestPrice}},
        };
       

        Product.updateOne(filter, update, options)
          .then((result) => {
            console.log("Aktualizacja zakończona pomyślnie");
            this.getPrice()
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
  async getPrice(){
    
     const productPrice =  await Product.find({},{_id:0,name: 1,chart: 1})
     productPrice.map(item=>{
      const splitName = item.name.split(" ", 2);
      const manufacture = splitName[0];
      const name = item.name.substring(manufacture.length).trim();
      const query = { manufacture: manufacture, name: name };
      const newValues = { $set: { price: item.chart.at(-1).price } };

      Cpu.updateOne(query,newValues,options)
      .then((result) => {
        console.log("Aktualizacja cen zakończona pomyślnie");
      })
      .catch((error) => {
        console.error(
          "Wystąpił błąd podczas aktualizacji cen",
          error
        );
      });
     })
     
    
  }
}
module.exports = new ProductActions();
