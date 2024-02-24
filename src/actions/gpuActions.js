const Gpu = require("../db/models/gpu");
const { itemsPerPage } = require("../config");
class GpuActions {
  async getAllGpu(req, res) {
    let {
      page,
      sortBy,
      manufactures,
      chipset,
      pcie,
      fg,
      memoryMin,
      memoryMax,
      priceMin,
      priceMax,
    } = req.query;
    console.log(manufactures);

    const [field, order] = sortBy.split("-");
    order === "asc" ? 1 : -1;
    const skip = (page - 1) * itemsPerPage;
    let query = {};

    if (manufactures !== "All") {
      query.manufacture = manufactures;
    }
    if (fg !== "All") {
      query.fg = fg;
    }
    if (pcie !== "All") {
      query.pcie = parseInt(pcie);
    }
    if (chipset !== "All") {
      query.chipset = chipset;
    }
    if (priceMin && priceMax) {
      query.price = { $gte: priceMin, $lte: priceMax };
    }
    if (memoryMin && memoryMax) {
      query.memory = { $gte: memoryMin, $lte: memoryMax };
    }
    if (
      manufactures == "null" ||
      fg == "null" ||
      pcie == "null" ||
      chipset == "null"
    ) {
      query = {};
    }
    console.log(query);


    const totalCount = await Gpu.countDocuments(query);

    Gpu.find(query)
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

  async getOneGpu(req, res) {
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
    Gpu.findOne({ name: rest, manufacture: first })
      .then((doc) => {
        return res.status(200).json({ data: doc });
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });
  }

  async getGpuFilters(req, res) {
    const manufacture = await Gpu.distinct("manufacture");
    const chipset = await Gpu.distinct("chipset");
    const pcie = await Gpu.distinct("pcie");
    const fg = await Gpu.distinct("fg");
    const maxMin = await Gpu.aggregate([
      {
        $group: {
          _id: null,
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
          maxMemory: { $max: "$memory" },
          minMemory: { $min: "$memory" },
          maxLength: { $max: "$length" },
          minLength: { $min: "$length" },
        },
      },
    ]);

    return res.status(200).json({
      manufacture: manufacture,
      fg: fg,
      chipset: chipset,
      pcie: pcie,
      maxMin: maxMin,
    });
  }
  async addRankToGpu(req, res) {
    try {
      const cursor = await Gpu.find({}).sort({ score: -1 });
      let rank = 1;
      for await (const doc of cursor) { 
        const filter = { _id: doc._id };
        const updateDoc = {
          $set: { rank: rank++ },
        };
        try {
          await Gpu.updateOne(filter, updateDoc); 
        } catch (updateError) {
          console.error(updateError); 
        }
      }
    } catch (error) {
      console.error(error); 
    }
  }
  async gpuSuggestion(req,res){
    const {_id,price,score} = req.body

    try {
        Gpu.find({score: {$gt: score},price: {$lt: price},_id: {$ne: _id}}).then((doc)=>{
          console.log(doc);
          return res.status(200).json(doc)
        })
    } catch (error) {
        return res.status(500).json({message: err.message})
    }
  }
}

module.exports = new GpuActions();
