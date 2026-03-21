const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: uuidv4 },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "customer" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

userSchema.statics.sanitize = function(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  const { passwordHash, __v, _id, ...safe } = obj;
  return safe;
};

userSchema.statics.createUser = async function({ name, email, password, role = "customer" }) {
  const existing = await this.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new Error("Email already registered");
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await this.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role
  });
  return this.sanitize(user);
};

userSchema.statics.verifyPassword = async function(plain, hashed) {
  return bcrypt.compare(plain, hashed);
};

const User = mongoose.model("User", userSchema);

const UserModel = {
  async create(data) {
    return User.createUser(data);
  },
  async findByEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return user || null;
  },
  async findById(id) {
    const user = await User.findOne({ id });
    return user ? UserModel.sanitize(user) : null;
  },
  async findAll() {
    const users = await User.find({});
    return users.map(UserModel.sanitize);
  },
  async update(id, updates) {
    const user = await User.findOne({ id });
    if (!user) throw new Error("User not found");
    if (updates.email) updates.email = updates.email.toLowerCase().trim();
    Object.assign(user, updates, { updatedAt: new Date() });
    await user.save();
    return UserModel.sanitize(user);
  },
  async delete(id) {
    const res = await User.deleteOne({ id });
    return res.deletedCount > 0;
  },
  sanitize(user) {
    if (!user) return null;
    const obj = user.toObject ? user.toObject() : { ...user };
    const { passwordHash, __v, _id, ...safe } = obj;
    return safe;
  },
  async verifyPassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }
};

module.exports = UserModel;
