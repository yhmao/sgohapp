
const moment = require('moment');

module.exports.updateQueryWithFilter = function(q,filter,req) {
    console.log('updateQueryWithFilter');
    query = q || {};
    console.log('query:', query);
    switch (filter) {
        case 'all':
          break;
        case 'today':
          query.dateUpdate = {$gte: moment().startOf('day'), $lte: moment().endOf('day')};
          break;
        case 'yesterday':
          query.dateUpdate = {$gte:moment().startOf('day').add(-1,'days'), $lte: moment().endOf('day').add(-1,'days')};
          break;
        case 'routine':
          query.patrolType = {$in: ['日常','routine']};
          break;
        case 'safety':
        query.patrolType = {$in: ['安全','safety']};
          break;
        case 'followup':
          query.status =  {$in: ['跟进','followup']};
          break;
        case 'closed':
          query.status =  {$in: ['已关闭','closed']};
          break;
        case 'my_responsible':
          query.responsible = req.user.username;
          break;
        case 'my_public':
          query.user = req.user.username;
          query.exposure = {$ne:"private"};
          break;
        case 'my_private':
          query.user = req.user.username;
          query.exposure = 'private';
          break;
        case 'my':
          query.user = req.user.username;
          delete query.exposure;
          break;
        case 'co':
          query.co = 'co';        
          break;        
        case 'projectManager':
          query.exposure = 'projectManager';
          break;
        default:
          // query = {};
      };
      return query;
};

module.exports.setPaginationCookies = function(array,q,res) {
    console.log('paginationCookies');
    let records = array || [];
    let count = records.length;
    console.log('count:', count);
    let perPage = 20;
    let pages = Math.ceil(count/perPage);
    console.log('pages:', pages);
    res.cookie('pages',pages);
    res.cookie('count', count);
    res.cookie('perPage', perPage);
    res.cookie('q',q);
};





