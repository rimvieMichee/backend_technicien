import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, departement, post, phone, Avatar, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      departement,
      post,
      phone,
      Avatar,
      role,
    });
    user.password = null
    res.status(201).json({ data: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { login, password } = req.body;
    try {
        console.log(login,password);
       const user = await User.findOne({ $or: [{ email: login }, { phone: login }] });
       console.log(user);
       if (!user) {
         return res.status(404).json({ message: "User not found" });
       }
         const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) {
           return res.status(401).json({ message: "Invalid credentials" });
         }

         delete user._doc.password;

         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });
         res.status(200).json({ token, data: user });
    } catch (error) {
       res.status(500).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const term = req.query.term || "";
    const {role, departement, post, phone, email, firstName, lastName } = req.query;
    const skip = (page - 1) * limit;
    const total = await User.countDocuments();

    const filter = {};
    if (term && term.trim() !== "") {
      const regex = { $regex: term, $options: "i" };
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex }
      ];
    }
    if (role) filter.role = role;
    if (departement) filter.departement = departement;
    if (post) filter.post = post;
    if (phone) filter.phone = phone;
    if (email) filter.email = email;
    if (firstName) filter.firstName = firstName;
    if (lastName) filter.lastName = lastName;

    const users = await User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    res.status(200).json({ data: users, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
    // const users = await User.find();
    // res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};  


