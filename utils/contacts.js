const { constants } = require('buffer')
const fs = require('fs')
// const chalk = require('chalk')
// const validator = requred('validator')

//membuat folde data jika belum ada
const dirPath = './data'
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
}

//membuat file contact json jika belum ada
const dataPath = './data/contacts.json'
if (!fs.existsSync(dataPath)){
    fs.writeFileSync(dataPath, '[]', 'utf-8')
}

//ambil semua data di contact .json 
const loadContact = () => {
    const fileBuffer = fs.readFileSync('data/contacts.json', 'utf-8')
    // json pars mengubah string ke object
    const contacts = JSON.parse(fileBuffer)
    return contacts
}

// cari contact berdasarkan nama
const findContact = (nama )=> {
    const contacts = loadContact()
    const contact = contacts.find((contact) => contact.nama.
        toLowerCase() === nama.toLowerCase())
    return contact
}

// menulis/menimpa file contact json dengan data yg baru | hanya dipakai dihalaman ini jadi tidak perlu di export
const saveContacts = (contacts) => {
    // dari data object >string>timpa ke file json
    fs.writeFileSync('data/contacts.json', JSON.stringify(contacts))
}

//menambahkan data contact baru |export ke app
const addContact = (contact) => {
    // string ke object
    const contacts = loadContact()
    contacts.push(contact)
    saveContacts(contacts)
}

//cek nama duplikat & mengirim ke proses data contact cekDuplikat
const cekDuplikat = (nama) => {
    const contacts = loadContact()
    return contacts.find((contact) => contact.nama === nama) 
}

// hapus contact
const deleteContact = (nama) => {
    // ngambil dari json
    const contacts = loadContact()
    const filteredContacts = contacts.filter((contact) => contact.nama !==nama) //mencari nama sesui (nama)

    // console.log(filteredContacts); //cek bisa apa tidak di terminal
    // menimpa file json 
    saveContacts(filteredContacts)
}

// fungsi mengubah contact
const updateContacts = (contactBaru) => {
    const contacts = loadContact()
    // hilangkan contact lama yg namanya sama dengan oldNama
    const filteredContacts = contacts.filter((contact) => contact.nama !== contactBaru.oldNama)
    // console.log(filteredContacts,contactBaru) //mengecek
    // delet properti oldName
    delete contactBaru.oldNama
    // push data baru ke json
    filteredContacts.push(contactBaru) //memindahkan data ke akhir array
    // timpa  dengan yg baru
    saveContacts(filteredContacts)
}

// export ke app js dan menirim load sebagai object
module.exports = { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts }

