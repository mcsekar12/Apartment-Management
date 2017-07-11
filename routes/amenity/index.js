
const amenityController = require('../../controllers').amenity;
module.exports = (app) => {


   app.post('/api/amenity/book', amenityController.bookVisitorPass);
   app.get('/api/amenity/book',amenityController.getVisitorPass);
    app.get('/api/amenity/book',amenityController.getVisitorPassByUser);
};