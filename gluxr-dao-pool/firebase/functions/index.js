const functions = require('firebase-functions');
const verifyMember = require('./verifyMember');
exports.verifyMember = verifyMember.verifyMember;
