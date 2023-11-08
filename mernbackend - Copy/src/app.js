const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const session = require("express-session"); // Add the session package
require("./db/conn");
const Register = require("./models/registers");
const Journal = require("./models/journal");
const Task = require("./models/task");
const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");



app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

// Set up session management
app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: true,
    })
);

// Routes for user registration and login
app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: password,
                confirmpassword: cpassword,
            });

            const registered = await registerEmployee.save();
            res.status(201).render("index");
        } else {
            res.send("passwords are not matching");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email });
        if (useremail.password === password) {
            // Store user data in the session after a successful login
            req.session.user = {
                _id: useremail._id,
                firstname: useremail.firstname,
                // Add other user data as needed
            };

            res.redirect("/dashboard");
        } else {
            res.send("invalid login details");
        }
    } catch (error) {
        res.status(400).send("invalid login details");
    }
});

// Routes for journal entries
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/journal-entry", (req, res) => {
    res.render("journal-entry");
});

app.post("/journal-entry", async (req, res) => {
    try {
        // Retrieve the user's ObjectId from the session
        const userId = req.session.user._id;

        const journalEntry = new Journal({
            user: userId,
            title: req.body.title,
            content: req.body.content,
        });

        const savedJournalEntry = await journalEntry.save();
        res.status(201).redirect("/journal-entries");
    } catch (error) {
        res.status(400).send("Error creating the journal entry");
    }
});

app.get("/journal-entries", async (req, res) => {
    try {
        // Retrieve the user's ObjectId from the session
        const userId = req.session.user._id;

        const journalEntries = await Journal.find({ user: userId });

        res.render("journal-entries", { journalEntries });
    } catch (error) {
        res.status(500).send("Error fetching journal entries");
    }
});
// ...

// Route for logging out
app.get("/logout", (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        } else {
            res.redirect("/"); // Redirect to the login page or any other page after logging out
        }
    });
});

// ...
app.use("/meditation-zone", express.static(path.join(__dirname, "../focused-breathing-main")));


app.get("/dashboard", (req, res) => {
    if (req.session.user) {
        const firstName = req.session.user.firstname;
        res.render("dashboard", { firstname: firstName });
    } else {
        res.redirect("/login");
    }
});

app.get("/todo", (req, res) => {
    res.render("todo"); // Assuming "todo.hbs" is your Handlebars template file
});


app.listen(port, () => {
    console.log(`Server is running at port no ${port}`);
});
