
const complaintController = require('../../controllers').complaint;
module.exports = (app) => {


    app.post('/api/complaint', complaintController.raiseComplaint);
    app.get('/api/complaint/all',complaintController.getComplaints);
    app.get('/api/complaint',complaintController.getComplaintsByUser);
};