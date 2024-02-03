const express = require('express')
const router = express.Router()
const userActions = require('../actions/userActions')
const cpuActions = require('../actions/cpuActions')
const productActions = require('../actions/productActions')
const cpuCoolerActions = require('../actions/cpuCoolerActions')
const moboActions = require('../actions/moboActions')
const gpuActions = require('../actions/gpuActions')
const osActions = require('../actions/osActions')
const storgaeActions = require('../actions/storageActions')

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
//RAM
//PSU
//CASE
//FAN
//STORAGE
router.get('/storage', storgaeActions.getAllStorage)
router.get('/getOneStorage',storgaeActions.getOneStorage)
router.get('/getStorageFilters' ,storgaeActions.getStorageFilters)
//OS
router.get('/os', osActions.getAllOs)
router.get('/getOneOs',osActions.getOneOs)
router.get('/getOsFilters' ,osActions.getOsFilters)

//router.post('/singup', usersActions.signupUser)
router.post('/login' ,userActions.loginUser) 
router.post('/verify-token' ,userActions.verifyUser) 
router.post('/addCart' ,userActions.addCart)
router.get('/getCart' ,userActions.getCart)  
router.post('/getProduct',productActions.getProduct)





module.exports = router;