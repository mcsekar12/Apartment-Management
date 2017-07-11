const parkingController = require('../../controllers').parking;
module.exports = (app) => {


   app.get('/api/parking/', parkingController.getParking);
   app.post('/api/parking/all', parkingController.getParkingAll);
   app.post('/api/parking/publish', parkingController.publishParkingAvailability);
    app.get('/api/parking/publish/:id', parkingController.getParkingAvailabilityByID);
    app.post('/api/parking', parkingController.getParkingAvailabilityByIDDate);
    app.post('/api/parking/book',parkingController.bookParking);
    app.get('/api/parking/booking',parkingController.getUserBooking)
    app.post('/api/instamojo/paymentLink',parkingController.instamojoPayment);

};