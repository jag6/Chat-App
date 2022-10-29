const express = require('express');
const config = require('../config');
const User = require('../models/userModel');

const userRouter = express();

//create user
userRouter.get(`/${config.USER_API}`, async (req, res) => {
    try {
        const user = new User({
            email: config.EMAIL,
            password: config.PASSWORD
        });
        const createdUser = await user.save();
        res.send(createdUser);
    }catch(err) {
        res.status(500).send({ message: err.message });
    }
});

module.exports = userRouter;