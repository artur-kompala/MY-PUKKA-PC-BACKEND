const express = require('express')
const router = express.Router()

const userActions = require('../actions/userActions')
const cpuActions = require('../actions/cpuActions')

router.get('/cpu', cpuActions.getAllCpu)
//router.post('/singup', usersActions.signupUser)
router.post('/login' ,userActions.loginUser) 
router.post('/verify-token' ,userActions.verifyUser) 





module.exports = router;