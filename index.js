const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const { Sequelize, QueryTypes } = require("sequelize");
const config = require("./config/config.json");
const upload = require("./middlewares/upload-file");

const sequelize = new Sequelize(config.development);

const blogModel = require("./models").blog;
const userModel = require("./models").user;

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./views"));

app.use("/assets", express.static(path.join(__dirname, "./assets")));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    name: "my-session",
    secret: "ewVsqWOyeb",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(flash());

app.get("/", home);
app.get("/blog", blog);
app.get("/add-blog", addBlogView);
app.post("/blog", upload.single("image"), addBlog);
app.get("/delete-blog/:id", deleteBlog);
app.get("/edit-blog/:id", editBlogView);
app.post("/edit-blog/:id", editBlog);
app.get("/contact", contact);
app.get("/testimonial", testimonial);
app.get("/blog-detail/:id", blogDetail);

app.get("/login", loginView);
app.get("/register", registerView);

app.post("/register", register);
app.post("/login", login);

function loginView(req, res) {
  res.render("login");
}

// Route untuk logout
app.get("/logout", (req, res) => {
  // Hapus sesi pengguna
  req.session.destroy((err) => {
      if (err) {
          return res.redirect('/'); 
      }
      res.redirect("/login");
  });
});

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store'); // Menghentikan caching di browser
    next();
});

const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
      return res.redirect('/login'); // Redirect ke halaman login jika sesi tidak ada
  }
  next();
};

// Contoh penggunaan middleware pada rute yang dilindungi
app.get("/", authMiddleware, (req, res) => {
  res.render("/");
});


async function login(req, res) {
  try {
    const { email, password } = req.body;

    // cek email user apakah ada di database
    const user = await userModel.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      req.flash("error", "Email / password salah!");
      return res.redirect("/login");
    }

    // cek password apakah valid dengan password yang sudah di hash
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      req.flash("error", "Email / password salah!");
      return res.redirect("/login");
    }

    req.session.user = user;

    req.flash("success", "Login berhasil!");

    res.redirect("/add-blog");
  } catch (error) {
    req.flash("error", "Something went wrong!");
    res.redirect("/");
  }
}

function registerView(req, res) {
  res.render("register");
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await userModel.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    req.flash("success", "Register berhasil!");
    res.redirect("/login");
  } catch (error) {
    req.flash("error", "Register gagal!");
    res.redirect("/register");
  }
}

function home(req, res) {
  const user = req.session.user;

  res.render("index", { user });
}

async function blog(req, res) {
  // const query = `SELECT public.blogs.*, public.users.name AS username FROM public.blogs INNER JOIN public.users
  // ON public.blogs."userId" = public.users.id;`;
  // const result = await sequelize.query(query, { type: QueryTypes.SELECT });
  const result = await blogModel.findAll({
    include: [
      {
        model: userModel,
        attributes: ["name"],
      },
    ],
  });

  const user = req.session.user;

  res.render("blog", { data: result, user });
}

async function deleteBlog(req, res) {
  const { id } = req.params;

  let result = await blogModel.findOne({
    where: {
      id: id,
    },
  });

  if (!result) return res.render("not-found");

  await blogModel.destroy({
    where: {
      id: id,
    },
  });
  res.redirect("/blog");
}

async function addBlog(req, res) {
  const { title, content } = req.body;
  const imagePath = req.file.filename;
  const userId = req.session.user.id;

  await blogModel.create({
    title: title,
    content: content,
    image: imagePath,
    userId: userId,
  });

  res.redirect("/blog");
}

async function editBlogView(req, res) {
  const { id } = req.params;

  const result = await blogModel.findOne({
    where: {
      id: id,
    },
  });

  if (!result) return res.render("not-found");

  res.render("edit-blog", { data: result });
}

async function editBlog(req, res) {
  const { id } = req.params;
  const { title, content } = req.body;

  const blog = await blogModel.findOne({
    where: {
      id: id,
    },
  });

  if (!blog) return res.render("not-found");

  blog.title = title;
  blog.content = content;

  await blog.save();

  res.redirect("/blog");
}

function addBlogView(req, res) {
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  res.render("add-blog");
}

function contact(req, res) {
  res.render("contact");
}

function testimonial(req, res) {
  res.render("testimonial");
}

async function blogDetail(req, res) {
  const { id } = req.params;
  const result = await blogModel.findOne({
    where: {
      id: id,
    },
    include: [
      {
        model: userModel, // Sertakan relasi ke user model untuk mengambil data penulis
        attributes: ["name"], // Ambil hanya atribut yang diperlukan, misalnya 'name'
      }
    ]
  });

  if (!result) return res.render("not-found");
  res.render("blog-detail", { data: result });
}

app.listen(port, () => {
  console.log("Server is running on PORT :", port);
});
