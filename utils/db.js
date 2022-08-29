//koneksi ke db aja

//manggil mongoose
const { default: mongoose } = require('mongoose')
const mongoos = require ('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/nodejs', {
  userNewUrlParser : true,
  userUnitfiedTopology:true,
  userCreateIndex: true
}) //konek mongoose

mongoose.connect('mongodb://127.0.0.1:27017/nodejs') //konek mongoose


//mebuat schema (blueprint)
const Contact = mongoose.model('Contact', {
  nama: {
    type: String,
    required:true,
  },
  nohp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },

})

//membuat 1 data
const contact1 = new Contact ({
  nama: 'Hafsa Shovia Nadziroh',
  nohp: '08623423224',
  email: 'hafsa@gmail.com',
}) 

//simpan ke collection
contact1.save().then((contact) => console.log(contact))
