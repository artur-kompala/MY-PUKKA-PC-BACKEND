const Fan = require("../db/models/fan");
const { itemsPerPage } = require("../config");
class FanActions {
  async getAllFan(req, res) {
    let {
      page,
      sortBy,
      manufactures,
      size,
      priceMin,
      priceMax,
      noiseMin,
      noiseMax,
      flowMin,
      flowMax
    } = req.query;

    const [field, order] = sortBy.split("-");
    order === "asc" ? 1 : -1;
    const skip = (page - 1) * itemsPerPage;
    let query = {};

    if (manufactures !== "All") {
      query.manufacture = manufactures;
    }
    if (size !== "All") {
      query.size = size;
    }
    if (noiseMin && noiseMax) {
      query.noise = { $gte: noiseMin, $lte: noiseMax };
    }
    if (priceMin && priceMax) {
      query.price = { $gte: priceMin, $lte: priceMax };
    }
    if (flowMin && flowMax) {
        query.flow = { $gte: flowMin, $lte: flowMax };
      }
    if (manufactures == "null" || size == "null") {
      query = {};
    }

    const totalCount = await Fan.countDocuments(query);

    Fan.find(query)
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

  async getOneFan(req, res) {
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
    Fan.findOne({ name: rest, manufacture: first })
      .then((doc) => {
        return res.status(200).json({ data: doc });
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });
  }
  async getFanFilters(req, res) {
    const manufacture = await Fan.distinct("manufacture");
    const size = await Fan.distinct("size");
    const maxMin = await Fan.aggregate([
      {
        $group: {
          _id: null,
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
          maxNoise: { $max: "$noise" },
          minNoise: { $min: "$noise" },
          maxFlow: { $max: "$flow" },
          minFlow: { $min: "$flow" },
        },
      },
    ]);

    return res
      .status(200)
      .json({
        manufacture: manufacture,
        size: size,
        maxMin: maxMin,
      });
  }
}

module.exports = new FanActions();
