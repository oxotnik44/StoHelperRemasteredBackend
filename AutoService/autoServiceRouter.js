const Router = require("express");
const router = new Router();
const controller = require("./autoServiceController");
const { check } = require("express-validator");

router.post(
  "/registrationAutoService",
  [
    check("login", "Логин пользователя не может быть пустым").notEmpty(),
    check("password", "Пароль пользователя не может быть пустым").notEmpty(),
  ],
  controller.registration
);
router.post("/loginAutoService", controller.login);
router.post("/shippingAssistance", controller.getService);
router.put("/addReview", controller.addReview);
router.post("/getReviews", controller.getReviews);
router.post("/getApplication", controller.getApplication);


module.exports = router;
