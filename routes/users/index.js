const usersController = require('../../controllers').users ;
const authController = require('../../controllers').auth ;
module.exports = (app) => {
  app.get('/api', (req, res) => {
    res.status(200).send({
    message: 'Welcome to the Todos API!',
  })
  
});

   app.post('/api/users', usersController.createUser);
   app.get('/api/users',usersController.getUsers);
   app.get('/api/users/:id',usersController.getUserByID);
   app.put('/api/users',usersController.updateUser);
   app.delete('/api/users/:id',usersController.deleteUser);

   app.post('/api/auth/login',authController.userAuthentication);

};