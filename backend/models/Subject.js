const mongoose = require('mongoose');
const questionSchema = require('./QuestionSchema');

const Aptitude = mongoose.model('AptitudeQuestion', questionSchema, 'aptitude_questions');
const Logical = mongoose.model('LogicalQuestion', questionSchema, 'logical_questions');
const Verbal = mongoose.model('VerbalQuestion', questionSchema, 'verbal_questions');
const Computer = mongoose.model('ComputerQuestion', questionSchema, 'computer_questions');
const Programming = mongoose.model('ProgrammingQuestion', questionSchema, 'programming_questions');
const GK = mongoose.model('GKQuestion', questionSchema, 'gk_questions');

module.exports = {
  aptitude: Aptitude,
  logical: Logical,
  verbal: Verbal,
  computer: Computer,
  programming: Programming,
  gk: GK
};
