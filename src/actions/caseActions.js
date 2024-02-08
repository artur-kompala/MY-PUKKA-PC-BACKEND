const Case = require("../db/models/case");
const { itemsPerPage } = require("../config");
class CaseActions {
  async getAllCase(req, res) {
    let {
      page,
      sortBy,
      manufactures,
      type,
      form_factor,
      priceMin,
      priceMax,
      gpu_lengthMin,
      gpu_lengthMax,
      cpu_cooler_lengthMin,
      cpu_cooler_lengthMax,
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
    if (form_factor !== "All") {
      query.form_factor = { $elemMatch: { $eq: form_factor } };
    }
    if (gpu_lengthMin && gpu_lengthMax) {
      query.gpu_length = { $gte: gpu_lengthMin, $lte: gpu_lengthMax };
    }
    if (priceMin && priceMax) {
      query.price = { $gte: priceMin, $lte: priceMax };
    }
    if (cpu_cooler_lengthMin && cpu_cooler_lengthMax) {
      query.cpu_cooler_length = { $gte: cpu_cooler_lengthMin, $lte: cpu_cooler_lengthMax };
    }
    if (manufactures == "null" || form_factor == "null" || type == "null") {
      query = {};
    }

    const totalCount = await Case.countDocuments(query);

    Case.find(query)
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

  async getOneCase(req, res) {
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
    Case.findOne({ name: rest, manufacture: first })
      .then((doc) => {
        return res.status(200).json({ data: doc });
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });
  }
  async getCaseFilters(req, res) {
    const manufacture = await Case.distinct("manufacture");
    const type = await Case.distinct("type");
    const form_factor = await Case.distinct("form_factor");
    const maxMin = await Case.aggregate([
      {
        $group: {
          _id: null,
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
          maxGpuLength: { $max: "$gpu_length" },
          minGpuLength: { $min: "$gpu_length" },
          maxCpuLength: { $max: "$cpu_cooler_length" },
          minCpuLength: { $min: "$cpu_cooler_length" },
        },
      },
    ]);

    return res
      .status(200)
      .json({
        manufacture: manufacture,
        type: type,
        form_factor: form_factor,
        maxMin: maxMin,
      });
  }
}

module.exports = new CaseActions();