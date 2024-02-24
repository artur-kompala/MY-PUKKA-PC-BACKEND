const express = require('express')
const multer = require('multer');
const router = express.Router()
const userActions = require('../actions/userActions')
const cpuActions = require('../actions/cpuActions')
const productActions = require('../actions/productActions')
const cpuCoolerActions = require('../actions/cpuCoolerActions')
const moboActions = require('../actions/moboActions')
const gpuActions = require('../actions/gpuActions')
const osActions = require('../actions/osActions')
const storgaeActions = require('../actions/storageActions')
const caseActions = require('../actions/caseActions')
const psuActions = require('../actions/psuActions')
const memoryActions = require('../actions/memoryActions')
const fanActions = require('../actions/fanActions')
const upload = multer({ storage: multer.memoryStorage() });
//CPU
router.get('/cpu', cpuActions.getAllCpu)
router.get('/getOneCpu',cpuActions.getOneCpu)
router.get('/getCpuFilters', cpuActions.getCpuFilters)
//CPUCOOLER
router.get('/cpuCooler', cpuCoolerActions.getAllCpuCooler)
router.get('/getOneCpuCooler',cpuCoolerActions.getOneCpuCooler)
router.get('/getCpuCoolerFilters' ,cpuCoolerActions.getCpuCoolerFilters)
//MOBO
router.get('/mobo',moboActions.getAllMobo)
router.get('/getOneMobo',moboActions.getOneMobo)
router.get('/getMoboFilters' ,moboActions.getMoboFilters)
//GPU
router.get('/gpu', gpuActions.getAllGpu)
router.get('/getOneGpu',gpuActions.getOneGpu)
router.get('/getGpuFilters' ,gpuActions.getGpuFilters)
router.post('/gpuSuggestion',gpuActions.gpuSuggestion)
//RAM
router.get('/memory', memoryActions.getAllMemory)
router.get('/getOneMemory',memoryActions.getOneMemory)
router.get('/getMemoryFilters' ,memoryActions.getMemoryFilters)
//PSU
router.get('/psu', psuActions.getAllPsu)
router.get('/getOnePsu',psuActions.getOnePsu)
router.get('/getPsuFilters' ,psuActions.getPsuFilters)
//CASE
router.get('/case', caseActions.getAllCase)
router.get('/getOneCase',caseActions.getOneCase)
router.get('/getCaseFilters' ,caseActions.getCaseFilters)
//FAN
router.get('/fan', fanActions.getAllFan)
router.get('/getOneFan',fanActions.getOneFan)
router.get('/getFanFilters' ,fanActions.getFanFilters)
//STORAGE
router.get('/storage', storgaeActions.getAllStorage)
router.get('/getOneStorage',storgaeActions.getOneStorage)
router.get('/getStorageFilters' ,storgaeActions.getStorageFilters)
//OS
router.get('/os', osActions.getAllOs)
router.get('/getOneOs',osActions.getOneOs)
router.get('/getOsFilters' ,osActions.getOsFilters)

router.post('/updateDatabase',userActions.updateDatabase)
router.post('/updateBenchmark',upload.single('file'),userActions.updateBenchmark)
router.post('/register', userActions.registerUser)

router.post('/login' ,userActions.loginUser) 
router.post('/verify-token' ,userActions.verifyUser) 
router.post('/addCart' ,userActions.addCart)
router.get('/getCart' ,userActions.getCart)  
router.delete('/deleteItemCart',userActions.deleteItemCart)
router.post('/getProduct',productActions.getProduct)




module.exports = router;