const cssFiles = require("./cssController");
const pageCssMapping = require("./pageCssMapping");
const { User } = require('../database/models');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const { validationResult } = require("express-validator");

const userController = {
  login: async (req, res) => {
    const currentPage = "login";
    const cssIndex = pageCssMapping[currentPage];

    var errors = validationResult(req)
    
    try {
      if (!errors.isEmpty()) {
        return res.render('users/login', {
            errors: errors.array(),
            old: req.body
        })};
      var user = await User.findOne({
        where: {
          email: req.body.email
        }
      });

      if (!user) {
        console.log(errors)
        return res.render(
          "/users/login?error=El mail o la contraseña son incorrectos n"
        );
      }
      if (req.body.password === req.body.password2) {
        try {
          const validPw =  await bcrypt.compareSync(req.body.password, user.dataValues.password)
          console.log(validPw)
          if (validPw === true) {

            if (req.body["keep-session"] === "on") {
              // Creamos la cookie email, guardamos el email del usuario y hacemos que expire en un dia
              res.cookie("email", user.dataValues.email, {
                maxAge: 1000 * 60 * 60 * 24,
              });
            }
            res.redirect("/");
          } 
        } catch (error) {
          res.redirect(
            "/users/login?error=Las contraseñas no coinciden "
          );
        }

      } else {
        res.redirect(
          "/users/login?error=Las contraseñas no coinciden"
        );
      }
    } catch (error) {
     res.redirect("/users/login");
    }
  },

  logOut: (req, res) => {
    // Elimina la propiedad 'user' de la sesión
    delete req.session.user

    if (req.cookies.email) {
      // Elimina la cookie 'email'
      res.clearCookie('email');

      res.redirect('/'); // Redirige a la página principal u otra ubicación
    } else {
      res.redirect('/'); // Redirige a la página principal si no hay cookie
    }
  },

  register: async (req, res) => {
    const currentPage = "index";
    const cssIndex = pageCssMapping[currentPage];
  
    const errors = validationResult(req);
  
    try {
      if (!errors.isEmpty()) {
        return res.render('users/register', {
          errors: errors.array(),
          old: req.body,
          cssFiles,
          cssIndex
        });
      }
  
      let avatar = 'defaultAvatar.jpg'; // Valor predeterminado para avatar
  
      if (req.file && req.file.filename) {
        // Si se proporciona un archivo, usa su nombre
        avatar = req.file.filename;
      }
  
      const user = await User.create({
        id: uuid.v4(),
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        username: req.body.username,
        type: "Customer",
        avatar: avatar // Asigna el valor predeterminado o el nombre de archivo
      });
  
      req.session.user = user;
      return res.render('./main/index', { user: req.session.user, cssFiles, cssIndex });
    } catch (error) {
      console.log(error);
      return res.redirect("/users/register?error=" + error);
    }
  }
  ,
  editProfile : async (req,res) =>{
    try {

     const updatedProfile = {
        ...req.body,
      };

      
      if (req.file) {
        updatedProfile.avatar = req.file.filename;
      }

      if (updatedProfile.avatar === '') {
        let imagen = await User.findOne({
          where: {
            id: updatedProfile.id
          }
        });

        updatedProfile.avatar = imagen.avatar;
      }

  

      await User.update(updatedProfile,{
        where:{
          id: updatedProfile.id
        }
      })

      res.redirect('/users/profile')
      
    } catch (error) {
      console.log(error)
    }

  },
  getLogin: (req, res) => {
    const currentPage = "login";
    const cssIndex = pageCssMapping[currentPage];
    res.render("./users/login", { cssFiles, cssIndex });
  },
  getRegister: (req, res) => {
    const currentPage = "register";
    const cssIndex = pageCssMapping[currentPage];
    res.render("./users/register", { cssFiles, cssIndex });
  },
  getProfile:  (req, res) => {
    const currentPage = "profile";
    const cssIndex = pageCssMapping[currentPage];
    res.render('./users/profile', { cssFiles, cssIndex, user: req.session.user })
  }
};

module.exports = userController;
