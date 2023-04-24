console.log('app/patrol/routes/myService.js');

const db = require('../database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const utils = require('../../../utils');

let setCurrentProject = function(req,res,next) {
    console.log('setCurrentProject...');
    let p = req.body.project;
    console.log('p:',p);
    console.log('req.user:', req.user);
    let user = req.user;
    user.projects.splice(user.projects.indexOf(p),1);
    user.projects.unshift(p);
    user.save();
    res.send(`Now current working project is ${user.projects[0]}.`);
};




module.exports = exports = {
    setCurrentProject,
};