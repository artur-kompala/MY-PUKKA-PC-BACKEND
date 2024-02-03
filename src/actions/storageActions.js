const Storage = require("../db/models/storage");
const { itemsPerPage } = require("../config");
class StorageActions {
  async getAllStorage(req, res) {
    let {
      page,
      sortBy,
      manufactures,
      type,
      inter,
      readMin,
      readMax,
      writeMin,
      writeMax,
      capacityMin,
      capacityMax,
      priceMin,
      priceMax
    } = req.query;
    console.log(capacityMin);

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
    if (inter !== "All") {
      query.interface = inter;
    }
    if (priceMin && priceMax) {
      query.price = { $gte: priceMin, $lte: priceMax };
    }
    if (readMin && readMax) {
      query.read = { $gte: readMin, $lte: readMax };
    }
    if (writeMin && writeMax) {
      query.write = { $gte: writeMin, $lte: writeMax };
    }
    if (capacityMin && capacityMax) {
      query.capacity = { $gte: capacityMin, $lte: capacityMax };
    }
    if (
      manufactures == "null" ||
      type == "null" ||
      inter == "null"
    ) {
      query = {};
    }
    console.log(query);

    const totalCount = await Storage.countDocuments(query);

    Storage.find(query)
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

  async getOneStorage(req, res) {
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
    Storage.findOne({ name: rest, manufacture: first })
      .then((doc) => {
        return res.status(200).json({ data: doc });
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });
  }

  async getStorageFilters(req, res) {
    const manufacture = await Storage.distinct("manufacture");
    const inter = await Storage.distinct("interface");
    const type = await Storage.distinct("type");
    const maxMin = await Storage.aggregate([
      {
        $group: {
          _id: null,
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
          maxRead: { $max: "$read" },
          minRead: { $min: "$read" },
          maxWrite: { $max: "$write" },
          minWrite: { $min: "$write" },
          maxCapacity: { $max: "$capacity" },
          minCapacity: { $min: "$capacity" },
        },
      },
    ]);

    return res.status(200).json({
      manufacture: manufacture,
      inter: inter,
      type: type,
      maxMin: maxMin,
    });
  }
  async addRankToStorage(req, res) {
    try {
      const cursor = await Storage.find({}).sort({ score: -1 });
      let rank = 1;
      for await (const doc of cursor) {
        
        const filter = { _id: doc._id };
        const updateDoc = {
          $set: { rank: rank++ },
        };
        try {
          await Storage.updateOne(filter, updateDoc);
          console.log(updateDoc); 
        } catch (updateError) {
          console.error(updateError);
        }
      }
    } catch (error) {
      console.error(error); 
    }
  }
}

module.exports = new StorageActions();
