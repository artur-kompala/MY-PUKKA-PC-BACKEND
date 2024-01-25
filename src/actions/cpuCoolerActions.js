const CpuCooler = require("../db/models/cpuCooler");
const { itemsPerPage } = require("../config");
class CpuCoolerActions {
  async getAllCpuCooler(req, res) {
    let {
      page,
      sortBy,
      manufactures,
      type,
      socket,
      priceMin,
      priceMax,
      tdpMin,
      tdpMax,
      sizeMin,
      sizeMax,
    } = req.query;

    const [field, order] = sortBy.split("-");
    order === "asc" ? 1 : -1;
    const skip = (page - 1) * itemsPerPage;
    let query = {};

    if (manufactures !== "All") {
      query.manufacture = manufactures;
    }
    if (type !== "All") {
      query.type = type;
    }
    if (socket !== "All") {
        query.socket= { $elemMatch: { $eq: socket }}
    }
    if (tdpMin && tdpMax) {
      query.tdp = { $gte: tdpMin, $lte: tdpMax };
    }
    if (priceMin && priceMax) {
      query.price = { $gte: priceMin, $lte: priceMax };
    }
    if (sizeMin && sizeMax) {
      query.size = { $gte: sizeMin, $lte: sizeMax };
    }
    if (manufactures == "null" || socket == "null" || type == "null") {
        console.log(manufactures);
      query = {};
    }
    console.log(query);

    const totalCount = await CpuCooler.countDocuments(query);

    CpuCooler.find(query)
      .sort({ [field]: order })
      .skip(skip)
      .limit(itemsPerPage)
      .then((doc) => {
        return res.status(200).json({ data: doc, total: totalCount });
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });
  }

  async getOneCpuCooler(req, res) {
    const { name } = req.query;
    function extractFirstWord(sentence) {
      const words = sentence.split(" ");
      if (words.length > 0) {
        const firstWord = words[0];
        const remainingSentence = words.slice(1).join(" ");
        return [firstWord, remainingSentence];
      } else {
        return [null, null];
      }
    }
    const [first, rest] = extractFirstWord(name);
    CpuCooler.findOne({ name: rest, manufacture: first })
      .then((doc) => {
        return res.status(200).json({ data: doc });
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });
  }
}

module.exports = new CpuCoolerActions();
