const Service = require("../models/AutoService");
const User = require("../models/User");
const Assistance = require("../models/Services");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { secret } = require("../config");
const Services = require("../models/Services");

// Общая функция для обработки запросов и ответов
const handleResponse = (res, data, errorMessage) => {
  if (!data || data.length === 0) {
    return res.status(404).json({ message: errorMessage });
  }
  return res.status(200).json(data);
};

const generateAccessToken = (id) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class userController {
  async registrationUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Ошибка при регистрации",
          errors: errors.array(),
        });
      }

      const { login, password } = req.body;

      // Проверка наличия пользователя
      const candidate = await User.findOne({ login });
      if (candidate) {
        return res.status(400).json({
          message: "Пользователь с таким логином уже существует",
        });
      }

      // Хеширование пароля
      const hashPassword = await bcrypt.hash(password, 7);

      // Создание пользователя
      const user = new User({
        login,
        password: hashPassword,
      });

      await user.save();

      return res
        .status(201)
        .json({ message: "Пользователь успешно зарегистрирован" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Ошибка регистрации" });
    }
  }
  async loginUser(req, res) {
    try {
      const { login, password } = req.body;
      // Проверка на наличие данных
      if (!login || !password) {
        return res
          .status(400)
          .json({ message: "Необходимо ввести логин и пароль" });
      }

      // Поиск пользователя по логину
      const user = await User.findOne({ login });
      if (!user) {
        return res
          .status(400)
          .json({ message: `Пользователь с логином ${login} не найден` });
      }

      // Асинхронная проверка пароля
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Неверный пароль" });
      }

      // Генерация токена
      const token = generateAccessToken(user._id);
      return res.json({ user, token });
    } catch (error) {
      // Логирование ошибки и возврат общей ошибки
      console.error("Ошибка авторизации:", error.message);
      return res.status(500).json({ message: "Ошибка авторизации" });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await User.find();
      handleResponse(res, users, "Пользователи не найдены");
    } catch (error) {
      console.error("Ошибка при получении пользователей:", error.message);
      return res
        .status(500)
        .json({ message: "Ошибка сервера при получении пользователей" });
    }
  }

  async getServices(req, res) {
    try {
      const assistance = await Services.find();
      handleResponse(res, assistance, "Сервисы не найдены");
    } catch (error) {
      console.error("Ошибка при получении сервисов:", error.message);
      return res
        .status(500)
        .json({ message: "Ошибка сервера при получении сервисов" });
    }
  }

  async sendApplication(req, res) {
    try {
      const { nameService, login, listAssistances, date, time } = req.body;
      const service = await Service.findOne({ nameService });

      if (!service) {
        return res
          .status(400)
          .json({ message: `Сервис ${nameService} не найден` });
      }

      service.application.push({ login, listAssistances, date, time });

      // Сохранение обновленного объекта Service
      await service.save();

      return res.json({ message: "Заявка успешно отправлена" });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Ошибка при отправке заявки" });
    }
  }
}

module.exports = new userController();
