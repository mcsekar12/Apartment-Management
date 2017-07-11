
const announcementController = require('../../controllers').announcement;
module.exports = (app) => {


    app.post('/api/announcement', announcementController.postAnnouncement);
    app.get('/api/announcement',announcementController.getAnnouncement);

};