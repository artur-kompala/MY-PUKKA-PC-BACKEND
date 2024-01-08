const Cpu = require("../db/models/cpu");

class CpuActions {
  async getAllCpu(req,res) {
      
      let { page, sortBy } = req.query;
      console.log(sortBy);
      sortBy = sortBy || "Rank-desc"
      page = page || 1;


      console.log(sortBy);
      const [field, order] = sortBy.split('-');
      order === 'asc' ? 1 : -1 
        
      

      const itemsPerPage = 10;
      const skip = (page - 1) * itemsPerPage;

        
      
      Cpu.find({ [field]: { $exists: true } }).sort({[field]: order}).skip(skip).limit(itemsPerPage)
        .then(doc=>{
        res.status(200).json(doc)
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
