const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const { Sequelize, QueryTypes } = require("sequelize");
const config = require("./config/config.json");
const upload = require("./middlewares/upload-file"); // Middleware untuk upload file

const sequelize = new Sequelize(config.development);

const blogModel = require("./models").blog;
const userModel = require("./models").user;

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./views"));

app.use("/assets", express.static(path.join(__dirname, "./assets")));
app.use("/uploads", express.static(path.join(__dirname, "./uploads"))); // Direktori untuk menyimpan file

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    name: "my-session",
    secret: "ewVsqWOyeb",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);
app.use(flash());

app.get("/", home);
app.get("/blog", blog);
app.get("/add-blog", addBlogView);
app.post("/blog", upload.single("image"), addBlog); // Middleware upload untuk tambah blog
app.get("/delete-blog/:id", deleteBlog);
app.get("/edit-blog/:id", editBlogView);
app.post("/edit-blog/:id", upload.single("image"), editBlog); // Middleware upload untuk edit blog
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
    return res.redirect('/login');
  }
  next();
};

// Route untuk home dengan middleware autentikasi
app.get("/", authMiddleware, (req, res) => {
  res.render("/");
});

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({
      where: { email },
    });

    if (!user) {
      req.flash("error", "Email / password salah!");
      return res.redirect("/login");
    }

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
      name,
      email,
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
  const result = await blogModel.findAll({
    include: [{ model: userModel, attributes: ["name"] }],
  });

  const user = req.session.user;
  res.render("blog", { data: result, user });
}

async function deleteBlog(req, res) {
  const { id } = req.params;

  let result = await blogModel.findOne({
    where: { id },
  });

  if (!result) return res.render("not-found");

  await blogModel.destroy({
    where: { id },
  });

  res.redirect("/blog");
}

async function addBlog(req, res) {
  const { title, content, isFeatured } = req.body;
  const imagePath = req.file.filename; // Ambil nama file yang di-upload
  const userId = req.session.user.id;

  await blogModel.create({
    title,
    content,
    image: imagePath,
    userId,
    isFeatured: isFeatured === "on", // Set true if checkbox is checked
  });

  res.redirect("/blog");
}

async function editBlogView(req, res) {
  const { id } = req.params;
  const result = await blogModel.findOne({
    where: { id },
  });

  if (!result) return res.render("not-found");

  res.render("edit-blog", { data: result });
}

async function editBlog(req, res) {
  const { id } = req.params;
  const { title, content } = req.body;

  const blog = await blogModel.findOne({
    where: { id },
  });

  if (!blog) return res.render("not-found");

  blog.title = title;
  blog.content = content;

  // Jika ada gambar baru yang diunggah, perbarui gambar
  if (req.file) {
    blog.image = req.file.filename;
  }

  await blog.save();

  res.redirect("/blog");
}

function addBlogView(req, res) {
  const user = req.session.user;
  if (!user) return res.redirect("/login");

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
    where: { id },
    include: [{ model: userModel, attributes: ["name"] }],
  });

  if (!result) return res.render("not-found");
  res.render("blog-detail", { data: result });
}

app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
