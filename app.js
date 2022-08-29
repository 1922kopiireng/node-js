const { log } = require('console')
const express = require('express')

//untuk mempermudah layout ejs
const expressLayouts = require('express-ejs-layouts') 
// morgan API
// const morgan = require('morgan')
// menagmbil object dari contact
const { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts } = require('./utils/contacts')
//midleware npm validasi
const { body, validationResult, check } = require('express-validator');
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

const app = express()
const port = 3000


//gunakan ejs
app.set('view engine', 'ejs')

// third party middleware
// memanggil express layouts sebelum dijalankan
app.use(expressLayouts)
// memanggil morgan
// app.use(morgan('dev'))

// build in middleware
app.use(express.static('public'))
// mmiddleware parshing mengambil data input
app.use(express.urlencoded())

//konfigurasi flash
app.use(cookieParser('secret'))
app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
    })
)
app.use(flash())
 


// application level middleware
// diakses dari atas kebawah
// app.use((req,res,next) => {
//     // muncul date di cmd
//     console.log('Time: ', Date.now());
//     // untuk melanjutkan middleware selanjutnya dan biar gak hank
//     next()
// })

// app.use((req,res,next) => {
//     console.log('Ini middleware 2');
//     next()
// })

//root
//route
app.get('/', (req, res) => {
    // respon string
//   res.send('Hello World!')

// respon json || method
    // res.json({
    //     nama : 'Jefry Kurniawan',
    //     email: 'jefryk@gmail.com',
    //     noHP: '0874234223',
    // })

    // respon file
    // res.sendFile('./index.html', {root: __dirname })
    const mahasiswa = [
        {
            nama: 'Jefry Kurniawan',
            email: 'jefrykurniawan@gmal.com',
        },
        {
            nama: 'Esty Aprisona',
            email: 'estyaprisan@gmal.com',
        },
        {
            nama: 'Erik',
            email: 'erik@gmal.com',
        },

    ]
    // ejs memanggil views
    res.render('index', { nama: 'Jefry Kurniawan',
    // memanggil express layout
    layout: 'layouts/main-layout',
    title: 'Halaman Home', 
    mahasiswa,
    })
})

app.get('/about', (req, res, next) => {
//   res.send('Ini adala halaman about')
    // res.sendFile('./about.html', {root: __dirname })
    res.render('about', {
        layout: 'layouts/main-layout',
        title: 'Halaman About', 
    })
})

app.get('/contact', (req, res) => {
    // mendapatkan data countact
    const  contacts = loadContact()
    // data keluar di terminal
    // console.log(contacts);
//   res.send('Ini adala halaman contact')
    // res.sendFile('./contact.html', {root: __dirname })
    res.render('contact', {
        layout: 'layouts/main-layout',
        title: 'Halaman Contact', 
        contacts,
        msg: req.flash('msg'), // mengirimkan msg dari req flash msg
    })
})

//halaman for tambah data contact | harus diatas /contact/:nama karena setalh contact jika tidak ada akan memanggil :name
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Form Tambah Data',
        layout: 'layouts/main-layout'
    })
})

//proses data contact |harus midleware dulu buat parhsing input
app.post('/contact', [
    // check untuk messsage inputan error
    body('nama').custom((value) => {
        const duplikat = cekDuplikat(value)
        if (duplikat) {
            throw new Error('Nama contact sudah terdaftar!')
        }
        return true
    }),
        check('email', 'Email tidak valid!').isEmail(), 
        check('nohp', 'No hp tidak valid!').isMobilePhone('id-ID')
    ], (req,res) => {
    const errors = validationResult(req) 
    if (!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array() });
        res.render('add-contact',{
            title: 'Form Tambah Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array()
        })
      }else{
        // ngambil data dari inputan
        addContact(req.body)
        // kirimkan flash massage
        req.flash('msg', 'Data contact berhasil ditambahkan!')
        // kemabli
        res.redirect('/contact')

      }
})

// proses delete contact
app.get('/contact/delete/:nama', (req,res) =>{
    // mengambil data contact yg mau di hapus
    const contact = findContact(req.params.nama)

    // jika contact tidak ada di json
    if (!contact) {
        res.status(404)
        res.send('<h1>404</h1>')
    } else {
        // res.send('ok')
        // delete berdasarkan nama yg dinput dari contact js
        deleteContact(req.params.nama)
         // kirimkan flash massage
         req.flash('msg', 'Data contact berhasil dihapuas!')
         // kemabli
         res.redirect('/contact')
    }
})

// form ubah data contact
app.get('/contact/edit/:nama', (req, res) => {
    // menampilkan data inputa ke body
    const contact =  findContact(req.params.nama)

    res.render('edit-contact', {
        title: 'Form Ubah Data Contact',
        layout: 'layouts/main-layout',
        contact,
    })
})

// proses ubah data | route update | jangan pakai 'get' karena dari edit-contact pakai 'post' wajib sama
// app.post('/contact/update', (req, res) => {
//     res.send(req.body)
// })
app.post('/contact/update', [
    // check untuk messsage inputan error
    body('nama').custom((value, { req }) => { //req untuk memunculkan req dari middleware ke sini
        const duplikat = cekDuplikat(value)
        if (value !== req.body.oldNama && duplikat) {  //cek nama sama gak dan cek duplikat
            throw new Error('Nama contact sudah terdaftar!')
        }
        return true 
    }),
        check('email', 'Email tidak valid!').isEmail(), 
        check('nohp', 'No hp tidak valid!').isMobilePhone('id-ID')
    ], ( req, res ) => {
    const errors = validationResult(req) 
    if (!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array() });
        res.render('edit-contact',{
            title: 'Form Ubah Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array(),
            contact: req.body, //menampilkan data yg sudah di edit
        })
      }else{
        // res.send(req.body)
        // // ngambil data dari inputan
        updateContacts(req.body)
        // // kirimkan flash massage
        req.flash('msg', 'Data contact berhasil diubah!')
        // // kemabli
        res.redirect('/contact')

      }
})

// halaman detail contact (hati" bikin route dibawah ini, bisa tidak muncul))
app.get('/contact/:nama', (req, res) => {
    // mencari data pada array sesuia nama
    const contact = findContact(req.params.nama)

    res.render('detail', {
        layout: 'layouts/main-layout',
        title: 'Halaman Detail Contact', 
        contact
    })
})

// app.get('/product/:id', (req, res) => {
//     res.send(`Product ID : ${req.params.id} <br> Category
//      : ${req.query.category}`)
// })

// middleware
// menjalankan request selsain request sebelmunya
app.use('/', (req, res) =>{
    // mengubah status 404
    res.status(404) 
    res.send('<h1>404</h1>')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


// const { log } = require('console');
// const { fstat } = require('fs');
// const http = require('http');
// const port = 3000;
// const fs = require('fs');

// const renderHTML = (path, res) => {
//     fs.readFile('./about.html', (err, data) =>{
//         if (err) {
//             res.writeHead(404);
//             res.write('Error: File not found');
//         }else{
//             res.write(data);
//         }
//         res.end();
//     });
    
// };

// http 
//     .createServer((req, res) => {
//         res.writeHead(200, {
//             'Content-type' : 'text/html',
//         });

//         const url = req.url;
//         switch(url){
//             case '/about':
//                 renderHTML('./about.html', res);
//                 break;
//             case '/contact':
//                 renderHTML('./contact.html', res);
//                 break;
//             default:
//                 renderHTML('./index.html', res);
//                 break;
//         }

//         // if ( url == '/about') {
//         //     // mengambil dari fariabel render html
//         //    renderHTML('./about', res)
//         // }else if ( url === '/contact'){
//         //     // manggil file
//         //     renderHTML('./contact.html', res);
//         // }else {
//         //     renderHTML('./index.html', res);
//         // }
//     })

//     //port server
//     .listen(port, () => {
//         console.log(`Server is listening on port ${port}..`);
//     });