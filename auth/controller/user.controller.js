import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendEmail } from "../../auth/utils/sendEmail.js";
import crypto from "crypto";

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


export const registerDeviceToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token manquant" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Éviter les doublons
    if (!user.deviceTokens.includes(token)) {
      user.deviceTokens.push(token);
      await user.save();
    }

    res.status(200).json({ message: "Device token enregistré avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



// Envoyer un code OTP pour réinitialiser le mot de passe
export const sendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Générer un code OTP à 6 chiffres
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Stocker OTP et date d'expiration (10 min)
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
        user.email,
        "Réinitialisation de mot de passe - Mistra",
        `Bonjour ${user.firstName} ${user.lastName},\n\nVoici votre code de réinitialisation : ${otp}\nCe code expire dans 10 minutes.\n\nCordialement,\nL'équipe Mistra`
    );

    res.status(200).json({ message: "Code OTP envoyé par e-mail." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vérifier le code OTP et réinitialiser le mot de passe
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }, // non expiré
    });

    if (!user) {
      return res.status(400).json({ message: "Code OTP invalide ou expiré." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Déconnexion (invalidation de device token)

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    user.deviceTokens = user.deviceTokens.filter((t) => t !== token);
    await user.save();

    res.status(200).json({ message: "Déconnexion réussie." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


