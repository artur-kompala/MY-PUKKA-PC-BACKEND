const Os = require("../db/models/os");
const { itemsPerPage } = require("../config");
class OsActions {
  async getAllOs(req, res) {
    let {
      page,
      sortBy,
      max_memory,
      priceMin,
      priceMax,
    } = req.query;

    const [field, order] = sortBy.split("-");
    order === "asc" ? 1 : -1;
    const skip = (page - 1) * itemsPerPage;
    let query = {};

    
    if (max_memory !== "All") {
      query.max_memory = parseInt(max_memory);
    }
    if (priceMin && priceMax) {
      query.price = { $gte: priceMin, $lte: priceMax };
    }
    if (max_memory == "null") {
      query = {};
    }

    const totalCount = await Os.countDocuments(query);

    Os.find(query)
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

  async getOneOs(req, res) {
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
    Os.findOne({ name: rest, manufacture: first })
      .then((doc) => {
        return res.status(200).json({ data: doc });
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });
  }
  async getOsFilters(req, res) {
    const max_memory = await Os.distinct("max_memory");
    const maxMin = await Os.aggregate([
      {
        $group: {
          _id: null,
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
        },
      },
    ]);

    return res
      .status(200)
      .json({
        max_memory: max_memory,
        maxMin: maxMin,
      });
  }
}

module.exports = new OsActions();