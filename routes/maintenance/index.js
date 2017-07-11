const maintenanceController = require('../../controllers').maintenance;
module.exports = (app) => {


   app.get('/api/maintenance/', maintenanceController.getMaintenanceByUser);
   app.get('/api/maintenance/all', maintenanceController.getMaintenanceAll);
   app.post('/api/maintenance/payment',maintenanceController.maintenancePayment);
   app.post('/api/maintanence/payment/webhook',maintenanceController.maintenancePaymentWebhook);


};