const mongoose = require('mongoose');

const topperSchema = new mongoose.Schema({
  name: {type: String,required: true},
  rank: {type: Number,required: true},
  year: {type: Number,required: true},
  gs1Marks: {type: Number,required: true},
  gs2Marks: {type: Number,required: true},
  essayMarks: {type: Number,required: true},
  prelimsGSMarks: {type: Number,required: true},
  prelimsCSATMarks: {type: Number,required: true},
  optionalSubject: {type: String,required: false},
  optional1Marks: {type: Number,required: false},
  remarks: {type: String}
});

const Topper = new mongoose.model("Topper", topperSchema);

module.exports = Topper;
