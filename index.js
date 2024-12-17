const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User"); // Импортируйте модель пользователя
const Services = require("./models/AutoService"); // Импортируйте модель пользователя

const PORT = process.env.PORT || 3000;
const userRouter = require("./User/userRouter"); // Убедитесь, что путь правильный
const serviceRouter = require("./AutoService/autoServiceRouter");
const app = express();
app.use(express.json());
// Подключение маршрутов
app.use("/user", userRouter);
app.use("/service", serviceRouter);
const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://artemnovikov1969:gWGp1CAQ8cRd77RQ@cluster0.tjqox.mongodb.net/StoHelperBackendRemastered`
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Завершить процесс при ошибке подключения
  }
};

// Главная функция запуска сервера
const start = async () => {
  await connectDB(); // Подключение к MongoDB
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
};

// Обработка несуществующих маршрутов
app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

start();
