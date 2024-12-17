const AutoService = require("../models/AutoService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { secret } = require("../config");
const User = require("../models/User");
const generateAccessToken = (id) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Ошибка при регистрации", errors });
      }
      const {
        login,
        password,
        nameService,
        webAddress,
        startOfWork,
        endOfWork,
        telephoneNumber,
        city,
        address,
        services,
      } = req.body;

      const candidate = await AutoService.findOne({ login }); // Изменено с Service на AutoService
      if (candidate) {
        return res
          .status(400)
          .json({ message: "Пользователь с таким логином уже существует" });
      }
      console.log(services);
      const hashPassword = bcrypt.hashSync(password, 7);
      const newService = new AutoService({
        login: login,
        password: hashPassword,
        nameService: nameService,
        webAddress: webAddress,
        startOfWork: startOfWork,
        endOfWork: endOfWork,
        telephoneNumber: telephoneNumber,
        city: city,
        address: address,
        services: services,
        reviews: [],
        declaration: [],
      });

      await newService.save();

      // Возвращаем newService вместо service
      return res.json({ service: newService }); // Обратите внимание на изменения здесь
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Ошибка регистрации" });
    }
  }

  // Остальные методы остаются без изменений...

  async login(req, res) {
    try {
      const { login, password } = req.body;
      console.log(login,password)
      const service = await AutoService.findOne({ login });
      if (!service) {
        return res
          .status(400)
          .json({ message: `Администратор с логином ${login} не найден` });
      }
      const validPassword = bcrypt.compareSync(password, service.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Введен неверный пароль" });
      }
      const token = generateAccessToken(service._id);
      return res.json({ service, token });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Ошибка авторизации" });
    }
  }

  async getService(req, res) {
    try {
      // Получение данных из запроса
      const { assistanceServices } = req.body;

      // Поиск всех записей в модели Service
      const services = await Service.find();

      // Фильтрация массива services на основе assistanceServices
      const filteredServices = services.filter((service) => {
        // Проверка, содержит ли текущая запись service все значения из массива assistanceServices
        return assistanceServices.every((assistanceService) =>
          service.assistanceServices.includes(assistanceService)
        );
      });

      // Отправка отфильтрованных данных в ответ
      res.json(filteredServices);
    } catch (e) {
      console.log(e);
    }
  }
  async getReviews(req, res) {
    try {
      // Получение имени сервиса из параметров запроса или из другого источника, например, из тела запроса
      const nameService = req.body.nameService; // или req.body.nameService, в зависимости от вашей реализации

      // Использование модели Service и метода find для поиска отзывов (reviews) по имени сервиса
      const services = await Service.find({ nameService }); // Предполагается, что модель Service имеет поле nameService, которое содержит имя сервиса

      // Создание массива, содержащего только отзывы (reviews)
      const reviewsArray = services.flatMap((service) => service.reviews); // Используем flatMap() для получения плоского массива отзывов

      // Отправка отзывов на фронтенд в виде JSON-ответа
      res.json(reviewsArray);
    } catch (err) {
      // Обработка ошибок, если они возникнут
      console.error(err);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }

  async addReview(req, res) {
    try {
      const { review, login, nameService } = req.body;

      // Найти уже существующую запись сервиса в базе по имени
      const existingService = await Service.findOne({
        nameService,
      });

      // Найти пользователя в базе по логину
      const user = await User.findOne({
        login,
      });

      if (existingService && user) {
        // Создать новый объект отзыва в соответствии с требуемым форматом
        const newReview = {
          review: review,
          userName: login,
        };

        // Добавить новый отзыв в массив отзывов в записи сервиса
        existingService.reviews.push(newReview);

        // Сохранить изменения в базе данных
        await existingService.save();

        res
          .status(200)
          .json({ success: true, message: "Отзыв успешно добавлен" });
      } else {
        // Если запись сервиса не найдена или пользователь не найден, вернуть ошибку
        return res.status(404).json({
          success: false,
          message: "Запись сервиса или пользователь не найдены",
        });
      }
    } catch (err) {
      console.error("Ошибка при добавлении отзыва:", err);
      res.status(500).json({
        success: false,
        message: "Произошла ошибка при добавлении отзыва",
      });
    }
  }
  async getApplication(req, res) {
    try {
      const { nameService, login } = req.body;

      // Найти уже существующую запись сервиса в базе по имени
      const existingService = await Service.findOne({ nameService });
      if (existingService) {
        // Получить список application сервиса
        const applications = existingService.application;

        // Проверить, содержит ли список application хотя бы одну запись с указанным логином
        const isSent = applications.some(
          (application) => application.login === login
        );

        if (isSent) {
          res.status(200).json(true);
        } else if (!isSent) {
          res.status(200).json(false);
        }
      } else {
        // Если запись сервиса не найдена, вернуть ошибку
        return res.status(404).json({
          success: false,
          message: "Запись сервиса не найдена",
        });
      }
    } catch (err) {
      console.error("Ошибка при получении application:", err);
      res.status(500).json({
        success: false,
        message: "Произошла ошибка при получении application",
      });
    }
  }
}

module.exports = new authController();
