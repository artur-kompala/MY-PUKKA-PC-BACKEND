const Psu = require("../db/models/psu");
const { itemsPerPage } = require("../config");
class PsuActions {
  async getAllPsu(req, res) {
    let {
      page,
      sortBy,
      manufactures,
      type,
      efficiency,
      priceMin,
      priceMax,
      wattageMin,
      wattageMax,
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
    if (efficiency !== "All") {
      query.efficiency = efficiency;
    }
    if (wattageMin && wattageMax) {
      query.wattage = { $gte: wattageMin, $lte: wattageMax };
    }
    if (priceMin && priceMax) {
      query.price = { $gte: priceMin, $lte: priceMax };
    }
    if (manufactures == "null" || efficiency == "null" || type == "null") {
      query = {};
    }

    const totalCount = await Psu.countDocuments(query);

    Psu.find(query)
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

  async getOnePsu(req, res) {
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
    Psu.findOne({ name: rest, manufacture: first })
      .then((doc) => {
        return res.status(200).json({ data: doc });
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });
  }
  async getPsuFilters(req, res) {
    const manufacture = await Psu.distinct("manufacture");
    const type = await Psu.distinct("type");
    const efficiency = await Psu.distinct("efficiency");
    const maxMin = await Psu.aggregate([
      {
        $group: {
          _id: null,
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
          maxWattage: { $max: "$wattage" },
          minWattage: { $min: "$wattage" },
        },
      },
    ]);

    return res
      .status(200)
      .json({
        manufacture: manufacture,
        type: type,
        efficiency: efficiency,
        maxMin: maxMin,
      });
  }
}

module.exports = new PsuActions();
