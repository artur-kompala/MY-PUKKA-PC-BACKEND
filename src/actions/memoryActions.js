const Memory = require("../db/models/memory");
const { itemsPerPage } = require("../config");
class MemoryActions {
  async getAllMemory(req, res) {
    let {
      page,
      sortBy,
      manufactures,
      type,
      priceMin,
      priceMax,
      speedMin,
      speedMax,
      capcityMin,
      capcityMax,
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
    if (speedMin && speedMax) {
      query.speed = { $gte: speedMin, $lte: speedMax };
    }
    if (priceMin && priceMax) {
      query.price = { $gte: priceMin, $lte: priceMax };
    }
    if (capcityMin && capcityMax) {
      query.capcity = { $gte: capcityMin, $lte: capcityMax };
    }
    if (manufactures == "null" || type == "null") {
      query = {};
    }

    const totalCount = await Memory.countDocuments(query);

    Memory.find(query)
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

  async getOneMemory(req, res) {
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
    Memory.findOne({ name: rest, manufacture: first })
      .then((doc) => {
        return res.status(200).json({ data: doc });
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });
  }
  async getMemoryFilters(req, res) {
    const manufacture = await Memory.distinct("manufacture");
    const type = await Memory.distinct("type");
    const maxMin = await Memory.aggregate([
      {
        $group: {
          _id: null,
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
          maxSpeed: { $max: "$speed" },
          minSpeed: { $min: "$speed" },
          maxCapacity: { $max: "$capacity" },
          minCapacity: { $min: "$capacity" },
        },
      },
    ]);

    return res
      .status(200)
      .json({
        manufacture: manufacture,
        type: type,
        maxMin: maxMin,
      });
  }
}

module.exports = new MemoryActions();
