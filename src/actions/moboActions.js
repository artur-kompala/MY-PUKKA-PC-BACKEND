const Mobo = require("../db/models/mobo");
const { itemsPerPage } = require("../config");

class MoboActions {
  async getAllMobo(req, res) {
    let {
      page,
      sortBy,
      manufactures,
      socket,
      form_factor,
      priceMin,
      priceMax,
      wifi,
      m2,
      chipset,
      integrated_graphics_support,
      pcie
    } = req.query;

    console.log(`interga: ${integrated_graphics_support}`);
    const [field, order] = sortBy.split("-");
    order === "asc" ? 1 : -1;
    const skip = (page - 1) * itemsPerPage;
    let query = {};

    if (manufactures !== "All") {
      query.manufacture = manufactures;
    }

    if (socket !== "All") {
      query.socket = socket;
    }
    if (chipset !== "All") {
      query.chipset = chipset;
    }
    if (form_factor !== "All") {
      query.form_factor = form_factor;
    }
    if (wifi !== "All") {
      query.wifi = wifi;
    }
    if (m2 !== "All") {
      query.m2 = m2;
    }
    if (integrated_graphics_support !== "All") {
      query.integrated_graphics_support = integrated_graphics_support;
    }
    if (pcie !== "All") {
      query.pcie = parseInt(pcie);
    }
    if (priceMin && priceMax) {
      query.price = { $gte: priceMin, $lte: priceMax };
    }

    if (
      manufactures == "null" ||
      socket == "null" ||
      form_factor == "null" ||
      m2 == "null" ||
      chipset == "null" ||
      pcie == "null" || 
      integrated_graphics_support == 'null'
    ) {
      query = {};
    }

    const totalCount = await Mobo.countDocuments(query);

    Mobo.find(query)
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

  async getOneMobo(req, res) {
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
    Mobo.findOne({ name: rest, manufacture: first })
      .then((doc) => {
        return res.status(200).json({ data: doc });
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });
  }
  async getMoboFilters(req, res) {
    const manufacture = await Mobo.distinct("manufacture");
    const chipset = await Mobo.distinct("chipset");
    const socket = await Mobo.distinct("socket");
    const form_factor = await Mobo.distinct("form_factor");
    const maxMin = await Mobo.aggregate([
      {
        $group: {
          _id: null,
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
        },
      },
    ]);

    return res.status(200).json({
      manufacture: manufacture,
      form_factor: form_factor,
      socket: socket,
      maxMin: maxMin,
      chipset: chipset,
    });
  }
}

module.exports = new MoboActions();
