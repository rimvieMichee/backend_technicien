import mongoose from "mongoose";
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    departement: {
      type: String,
      required: true,
    },
    post : {
        type: String,
        required: true,
    },
    phone : {
        type: String,
        required: true,
        unique: true
    },
    Avatar : {
        type: String,
    },
    role: {
      type: String,
      enum: ["user", "manager","admin"],
      default: "user",
    },

  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;