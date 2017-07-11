var db = require('../config/db');
var shortid = require('shortid');
module.exports = {



postAnnouncement :function(req,res){


db.transaction(function(trx){

let insertParams={

announcement_id:shortid.generate(),
announcement_date : new Date(),
announcement_content: req.body.announcement_content,
announcement_title :req.body.announcement_title

};
 trx.insert({data:insertParams}).into('parking_system.announcement').
 returning('id').then(results=>{

trx.commit();
  res.status(200).json({
  status : 'success',
  data  : results,
  message: 'Announcement posted successfully'
 })

}).catch(err=>{
console.log(err);
  res.status(500).json({
  status : 'fail',
  message: 'Error in posting announcement'
 })

});


});



},

getAnnouncement : function(req,res){


db.raw(`SELECT data as announcement_data from parking_system.announcement`
)
.then(results=>{

let resultData=[];

if(results.rows.length>0){


results.rows.forEach(val=>{

let announcement_data = Object.assign({}, val.announcement_data);

resultData.push(announcement_data);


})

}

res.status(200).json({
    status :'success',
    data: resultData,
    message:"Data fetch Successfull"
})

}).catch(err=>{
    console.log(err);
res.status(500).json({
    status :'fail',
    data: 'Error in fetching parking details'
})

});

},





}