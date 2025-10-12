const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]},
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "team member", "manager", "owner"],
    default: "team member",
  },
  phone: { type: String },
  department: { type: String },
  profileImage: { type: String }, // URL/path to profile avatar
  resetPasswordToken:{type:String}, //reset password token
  resetPasswordExpire:{type:Date}, //token expire time
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
