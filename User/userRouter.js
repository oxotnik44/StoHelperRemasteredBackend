const Router = require("express");
const router = new Router();
const controller = require("./userController");
const { check } = require("express-validator");

router.post(
  "/registrationUser",
  [
    check("login", "Логин пользователя не может быть пустым").notEmpty(),
    check("password", "Пароль пользователя не может быть пустым").notEmpty(),
  ],
  controller.registrationUser
);
router.post("/loginUser", controller.loginUser);
router.get("/getServices", controller.getServices);
router.get("/users", controller.getUsers);
router.get("/retrievedAssistance", controller.getServices);
router.put("/sendApplication", controller.sendApplication);

module.exports = router;
