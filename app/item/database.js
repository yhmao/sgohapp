
const MBP_Ali   = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

const URI = MBP_Ali;
console.log('Connect ALI db from apple MBP.')

const Mongoose = require('mongoose').Mongoose
const mongoose = new Mongoose();
mongoose.connect(URI);

const itemSchema = new mongoose.Schema({
    Cat:String,
    System:String,
    Document:String,
    Venue: String,
    Group: String,
    Name: String,
    CountryOfOrigin: String,
    RecommendedModel: String,
    RecommendedBrands: String,
    Section: String,
    Group1: String,
    Group2: String,
    System: String,
    Item: String,
    ItemE: String,
    ItemC: String,
    ParametersE: String,
    ParametersC: String,
    ApprovedProducts: String,
    Quantity: Number,
    Origin: String,
    Section: String,
    Text:String,
    dateCreate: Date,
    dateUpdated: Date,


},{statics:false});
const Item = mongoose.model('Item',itemSchema);

module.exports = Item;