const Cpu = require("../db/models/cpu");
class CpuActions {
  async getAllCpu(req,res) {
      
      let { page, sortBy, manufactures, graphic,smt,coreCountMin,coreCountMax,coreClockMin,coreClockMax,boostClockMin,boostClockMax,tdpMin,tdpMax,priceMin,priceMax,scoreMin,scoreMax} = req.query;
      sortBy = sortBy || "Rank-desc"
      page = page || 1;


      const [field, order] = sortBy.split('-');
      order === 'asc' ? 1 : -1 
        
      

      const itemsPerPage = 10;
      const skip = (page - 1) * itemsPerPage;

      //[field]: { $exists: true}
      let query = {
        
      };
      
      if (manufactures !== 'All') {
        query.manufacture = manufactures;
      }
      if (smt !== 'All') {
        query.smt = smt;
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
        res.status(200).json({data: doc,total: totalCount})
        }).catch(err=>{
        return res.status(500).json({message: err.message})
      })
  }
  async countCpu(req,res){
    Cpu.find({}).count()
        .then(doc=>{
        res.status(200).json(doc)
        }).catch(err=>{
        return res.status(500).json({message: err.message})
    })
  }
  
}

module.exports = new CpuActions();
