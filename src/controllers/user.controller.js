import asyncHandler from 'express-async-handler';

import User from '../models/user.model.js';

const registerUser = asyncHandler(async (req, res) => {
const {email, password, fullName , username} = req.body;
console.log('email :',email);
});
const loginUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'User logged in successfully',
    });
});

export {registerUser};
export {loginUser};