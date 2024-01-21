const express = require('express')
const router = express.Router()
const userActions = require('../actions/userActions')
const cpuActions = require('../actions/cpuActions')
const productActions = require('../actions/productActions')

router.get('/cpu', cpuActions.getAllCpu)
router.get('/cpuCount', cpuActions.countCpu)
//router.post('/singup', usersActions.signupUser)
router.post('/login' ,userActions.loginUser) 
router.post('/verify-token' ,userActions.verifyUser) 
router.post('/addCart' ,userActions.addCart)
router.get('/getCart' ,userActions.getCart)  
router.post('/getProduct',productActions.getProduct)








module.exports = router;