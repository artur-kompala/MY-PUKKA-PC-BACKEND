const Cpu = require("../db/models/cpu");

class CpuActions {
  async getAllCpu(req,res) {
      let { page, sortBy } = req.query;
      sortBy = sortBy || "Rank-asc"
      page = page || 1;

      console.log(page);
      const [field, order] = sortBy.split('-');
      order === 'asc' ? 1 : -1 
        
      

      const itemsPerPage = 10;
      const skip = (page - 1) * itemsPerPage;

        
      
      Cpu.find({}).skip(skip).limit(itemsPerPage).sort({[field]: order})
        .then(doc=>{
        res.status(200).json(doc)
        }).catch(err=>{
        return res.status(500).json({message: err.message})
      })
    
      
  }
}

module.exports = new CpuActions();
