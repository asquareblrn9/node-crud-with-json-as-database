
const express = require('express')
const app = express()
const fs= require('fs')
const axios = require('axios');
const route = express.Router()
const cors = require('cors');
const req = require('express/lib/request');
const res = require('express/lib/response');
app.use(express.json()); // Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

//this line is required to parse the request body
app.use(express.json())
app.use(cors())

// set view engine
app.set("view engine", "ejs")
//app.set("views", path.resolve(__dirname, "views/ejs"))

// load assets
app.use(express.static('assets'));


app.get('/', (req, res) => {
    axios.get('http://localhost:3000/user/list')
        .then(function(response){
            res.render('index', { users : response.data });
        })
        .catch(err =>{
            res.send(err);
        })

})

app.get('/update-user/', (req, res) => {
    axios.get('http://localhost:3000/update-user/:username')
        .then(function(response){
            //console.log(finds)
           res.render('update_user', {id: req.query.id,
            blog: req.query.blog,
            description: req.query.description,
            title: req.query.title})
            
        })
        .catch(err =>{
            res.send(err);
        })

})





app.get('/update-user/:username', (req, res)=> {
       //get the username from url
       const id = req.params.id
       //get the update data
      
       const existUsers = getUserData()
       //check if the username exist or not       
       const finds = existUsers.filter( user => user.id === id)
      if(finds){
       res.send(finds)
      }else{ 
          res.status(404).send({ message : "Not found user with id "+ id})
          
      }
      
      

})



/* Create - POST method */
app.post('/user/add', (req, res) => {

  
//get the existing user data
const existUsers = getUserData()


const userData = req.body


//get the new user data from post request

//check if the userData fields are missing
if (userData.title == null || userData.id == null || userData.description == null || userData.blog == null) {
    //return res.status(401).send({error: true, msg: 'User data missing'})
   return  res.status(500).send({
        message : {error: true, msg: 'User data missing'}
    });
}

//check if the username exist already
const findExist = existUsers.find( user => user.id === userData.id )
if (findExist) {
    return res.status(409).send({error: true, msg: 'Id already exist'})
}
//append the user data
existUsers.push(userData)
//save the new user data
saveUserData(existUsers);

//res.send({success: true, msg: 'User data added successfully'})
 res.redirect('/');
})




/* Read - GET method */
app.get('/user/list', (req, res) => {
    
    const users = getUserData()
    res.send(users)
})

// app.get('/update/:username', (req,res) =>{

//     //get the username from url
//     const username = req.params.username
//     //get the update data
   
//     const existUsers = getUserData()
//     //check if the username exist or not       
//     const findExist = existUsers.find( user => user.username === username )
//     if (!findExist) {
//         return res.status(409).send({error: true, msg: 'username not exist'})
//     }
//     else{
//         res.send(findExist);

//     }
// })



/* Update - Patch method */
app.patch('/user/update/:id', (req, res) => {
    //get the username from url
    const id = req.params.id
    //get the update data
    const userData = req.body
    //get the existing user data
    const existUsers = getUserData()
    //check if the username exist or not       
    const findExist = existUsers.find( user => user.id === id )
    if (!findExist) {
        return res.status(409).send({error: true, msg: 'id not exist'})
    }
    res.send(findExist);
      //filter the userdata
    const updateUser = existUsers.filter( user => user.id !== id )
    //push the updated data
    updateUser.push(userData)
    
    //finally save it
    saveUserData(updateUser)
    
    res.redirect('/')
    
   
})
/* Delete - Delete method */
app.delete('/user/delete/:id', (req, res) => {
    const id = req.params.id
    //get the existing userdata
    const existUsers = getUserData()
    //filter the userdata to remove it
    const filterUser = existUsers.filter( user => user.id !== id )
    if ( existUsers.length === filterUser.length ) {
        return res.status(409).send({error: true, msg: 'id does not exist'})
    }
    //save the filtered data
    saveUserData(filterUser)
    res.send({success: true, msg: 'User removed successfully'})
    
})
/* util functions */
//read the user data from json file
const saveUserData = (data) => {
    
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('json/file.json', stringifyData)
}
//get the user data from json file
const getUserData = () => {
    const jsonData = fs.readFileSync('json/file.json')
    return JSON.parse(jsonData)    
}

//routing
app.get('/add-user', (req, res) =>{
    res.render('add_user')
})




//configure the server port
app.listen(3000, () => {
    console.log('Server runs on port 3000')
})