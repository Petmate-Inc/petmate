/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

const defaultMessage = {
  status: true,
  msg: "Welcome to PetMate API",
  data: {
    name: "PetMate",
    version: "1.0.0",
  },
};
Route.get("/", async () => {
  return defaultMessage;
});

Route.get("/api/v1/", async () => {
  return defaultMessage;
});

Route.group(() => {
  Route.post("login", "UsersController.login");
  Route.post("signup", "UsersController.signup");
  Route.get("verify-user/:token", "UsersController.verify");
  Route.get("details", "UsersController.details").middleware("auth");
  Route.post(
    "resend-verification-link",
    "UsersController.resendVerificationLink"
  );
  Route.post("recover-password", "UsersController.recoverPassword");
  Route.patch("change-password", "UsersController.changePassword").middleware(
    "auth"
  );
  Route.post("reset-password", "UsersController.resetPassword");
}).prefix("/api/v1/");

Route.group(() => {
  Route.get("/auth/google", async ({ ally }) => {
    return ally.use("google").redirect;
  });
  Route.get("/auth/facebook", async ({ ally }) => {
    return ally.use("google").redirect;
  });
}).prefix("/api/v1/");
