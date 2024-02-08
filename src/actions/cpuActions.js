const Cpu = require("../db/models/cpu");
const {itemsPerPage} = require('../config')
class CpuActions {
  async getAllCpu(req,res) {
      
      let { page, sortBy, manufactures, graphic,smt,coreCountMin,coreCountMax,coreClockMin,coreClockMax,boostClockMin,boostClockMax,tdpMin,tdpMax,priceMin,priceMax,socket,coreFamily} = req.query;

      const [field, order] = sortBy.split('-');
      order === 'asc' ? 1 : -1 
  
      const skip = (page - 1) * itemsPerPage;

      let query = {};
      
      if (manufactures !== 'All') {
        query.manufacture = manufactures;
      }
      if (smt !== 'All') {
        query.smt = smt;
      }
      if (coreFamily !== 'All') {
        query.core_family = coreFamily;
      }
      if (socket !== 'All') {
        query.socket = socket;
      }
      if (graphic !== 'All') {
        if(graphic === 'No')query.graphics = {$eq: null};
        else query.graphics = {$nin: [null, ""]};
      }
      if(coreCountMin && coreCountMax){
        query.core_count = {"$gte": coreCountMin, "$lte": coreCountMax}
      }
      if(coreClockMin && coreClockMax){
        query.core_clock = {"$gte": coreClockMin, "$lte": coreClockMax}
      }
      if(boostClockMin && boostClockMax){
        query.boost_clock = {"$gte": boostClockMin, "$lte": boostClockMax}
      }
      if(tdpMin && tdpMax){
        query.tdp = {"$gte": tdpMin, "$lte": tdpMax}
      }
      if(priceMin && priceMax){
        query.price = {"$gte": priceMin, "$lte": priceMax}
      }
      if(manufactures == 'null'){
        query = {}
      }

      const totalCount = await Cpu.countDocuments(query);
      
      Cpu.find(query).sort({[field]: order}).skip(skip).limit(itemsPerPage)
        .then(doc=>{
        return res.status(200).json({data: doc,total: totalCount})
        }).catch(err=>{
        return res.status(500).json({message: err.message})
      })
  }
  async getOneCpu(req,res){
      const {gid} = req.query
    
      Cpu.findOne({gid: gid})
      .then(doc=>{
        return res.status(200).json({data: doc})
      })
      .catch(err=>{
        return res.status(500).json({message: err.message})
      })
      
  }
  async getCpuFilters(req, res) {
    const manufacture = await Cpu.distinct("manufacture");
    const coreFamily = await Cpu.distinct("core_family");
    const socket = await Cpu.distinct("socket");
    const maxMin = await Cpu.aggregate([
      {
        $group: {
          _id: null,
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
          maxTdp: { $max: "$tdp" },
          minTdp: { $min: "$tdp" },
          maxCoreClock: { $max: "$core_clock" },
          minCoreClock: { $min: "$core_clock" },
          maxCoreCount: { $max: "$core_count" },
          minCoreCount: { $min: "$core_count" },
          maxBoostClock: { $max: "$boost_clock" },
          minBoostClock: { $min: "$boost_clock" },
        },
      },
    ]);

    return res
      .status(200)
      .json({
        manufacture: manufacture,
        coreFamily: coreFamily,
        socket: socket,
        maxMin: maxMin,
      });
  }
  
  
}

module.exports = new CpuActions();
