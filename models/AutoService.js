const mongoose = require("mongoose");

// Определение схемы AutoService
const autoServiceSchema = new mongoose.Schema({
  login: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  nameService: { type: String, required: true, unique: true },
  webAddress: { type: String, required: true },
  startOfWork: { type: String, required: true },
  endOfWork: { type: String, required: true },
  telephoneNumber: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  services: [{ type: String }],
  reviews: [
    {
      review: String,
      userName: String,
    },
  ],
  declaration: [
    {
      login: String,
      listAssistances: [String],
      date: String,
      time: String,
    },
  ],
});

// Создание модели AutoService на основе схемы
const AutoService = mongoose.model("AutoService", autoServiceSchema);

module.exports = AutoService;
