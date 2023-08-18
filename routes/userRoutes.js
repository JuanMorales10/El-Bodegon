const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const avatar = require('../middlewares/processAvatar');

// Routes GET
router.get("/login", userController.getLogin);
router.get("/register", userController.getRegister);

// Routes POST
router.post('/createUser', function (req,res){
    console.log(req)
});

router.post("/register", avatar.single("avatar"), userController.register);

module.exports = router;