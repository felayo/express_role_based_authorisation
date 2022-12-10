import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();
    res.status(200).json({
      id: newUser._id,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      username: newUser.username,
      gender: newUser.gender,
      date_of_birth: newUser.date_of_birth,
      date_created: newUser.createdAt,
      date_updated: newUser.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found!"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong password or username!"));

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );

    const { password, isAdmin, username, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ username, isAdmin, token });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({
      id: updatedUser._id,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      username: updatedUser.username,
      email: updatedUser.email,
      gender: updatedUser.gender,
      date_of_birth: updatedUser.date_of_birth,
      date_created: updatedUser.createAt,
      date_updated: updatedUser.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};
export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      date_created: user.createdAt,
      date_updated: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};
export const getUsers = async (req, res, next) => {
  //console.log({ user: req.user.id });
  const { page = 1, limit = 10} = req.query;
  try {
    // execute query with page and limit values
    const users = await User.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // get total documents in the Posts collection
    const count = await User.countDocuments();

    const mappedUsers = users.map((user) => {
      return {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        date_created: user.createdAt,
        date_updated: user.updatedAt,
      };
    });
    res
      .status(200)
      .json({ data: mappedUsers, totalPages: Math.ceil(count / limit), currentPage: page });
  } catch (err) {
    next(err);
  }
};

export const filterFields = async (req, res, next) => {
  const fields = req.query;
  try {
    const users = await User.find();

    const filteredUsers = users.filter((user) => {
      let isValid = true;
      for (let key in fields) {
        console.log(key, user[key], fields[key]);
        isValid = isValid && user[key] == fields[key];
        console.log(isValid)
      }
      return isValid;
    });
    const mappedUsers = filteredUsers.map((user) => {
      return {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        date_created: user.createdAt,
        date_updated: user.updatedAt,
      };
    });
    res.status(200).json(mappedUsers);
  } catch (err) {
    next(err);
  }
};
