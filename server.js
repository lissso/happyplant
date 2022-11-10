const express = require("express");
const app = express();
const db = require("./db");
const bcrypt = require("./bcrypt");
//const { requireLogout,requireSignedPetition, registerProfile} = require("./middleware.js")

/*
 ********************** - setup HB EXPRESS -  **********************
 */
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");
const { hash } = require("bcryptjs");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// const { COOKIE_SECRET } = require("./secrets");
// const COOKIE_SECRET = require("./secrets.json").COOKIE_SECRET
const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;

/*
 ********************** - Middlewear - **********************
 */

app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false,
    })
);
// console.log("COOKIE_SECRET", COOKIE_SECRET);
// console.log("process.env", process.env);
//cookie session is much safer then cookie parser
app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        // makes it safer
        sameSite: true,
    })
);

app.use((req, res, next) => {
    console.log("---------------------");
    console.log("req.url:", req.url);
    console.log("req.method:", req.method);
    console.log("req.session:", req.session);
    console.log("---------------------");
    next();
});

/*
 ********************** - Register - **********************
 */
app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    console.log("register: req.body", req.body);
    bcrypt
        .hash(req.body.password)
        .then((hashPwd) => {
            console.log("results hash", hashPwd);

            db.registerUser(
                req.body.first,
                req.body.last,
                req.body.email,
                hashPwd
            ).then((result) => {
                // console.log("results hash USER", hashPwd);
                // console.log("results row", result);

                req.session.user_id = result.rows[0].id;
                req.session.login = true;

                res.redirect("/profile");
            });
        })
        .catch((err) => console.log("err in db.hash:", err));
});

/*
 **********************  - Login -  **********************
 */

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    //find email
    console.log("result email body: ", req.body.email);
    db.getEmail(req.body.email).then((result) => {
        console.log("result email: ", result.rows);
        if (result.rows[0]) {
            bcrypt
                .compare(req.body.password, result.rows[0].passwd)
                .then((isMatched) => {
                    console.log("result bcrypt: ", result);
                    if (isMatched) {
                        //is bei boolean
                        req.session.login = true;
                        req.session.user_id = result.rows[0].id;
                        //datenbank fragen ob user id im cookie
                        db.findSignature(req.session.user_id).then(
                            (results) => {
                                console.log(
                                    "result getUserId: ",
                                    results.rows[0].id
                                );
                                if (results.rows.length > 0) {
                                    req.session.signatureId =
                                        results.rows[0].id;
                                }
                                res.redirect("/petition");
                            }
                        );
                    }
                })
                .catch((err) => {
                    console.log("err in compare:", err);
                    res.render("login", {
                        error: true,
                    });
                });
        } else {
            res.render("login", {
                error: true,
            });
        }
    });
});

/*
 ********************** -  Profile -  **********************
 */

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    if (req.body.age === "" && req.body.city === "" && req.body.url === "") {
        res.redirect("/petition");
    } else {
        let url = req.body.url;
        console.log(url);
        if (
            !url.startsWith("//") &&
            !url.startsWith("http://") &&
            !url.startsWith("https://")
        ) {
            url = "";
        }
        db.registerProfile(
            req.body.age,
            req.body.city,
            url,
            req.session.user_id
        )
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("err in addUserInfo ", err);
                res.render("profile", {
                    error: true,
                });
            });
    }
});
/*
 ********************** -  edit Profile -  **********************
 */

app.get("/edit", (req, res) => {
    db.getSignerProfileByID(req.session.user_id).then((result) => {
        console.log("result.rows edit-profile:", result.rows);

        res.render("edit", {
            user: result.rows[0],
        });
    });
});

app.post("/edit", (req, res) => {
    if (req.body.passwd === "") {
        Promise.all([
            db.updateUserwithoutPW(
                req.body.first,
                req.body.last,
                req.body.email,
                req.session.user_id
            ),
            db.updateProfile(
                req.body.age,
                req.body.city,
                req.body.url,
                req.session.user_id
            ),
        ])
            .then(() => {
                console.log("allUpdated");
                res.redirect("/signers");
            })
            .catch((err) => {
                console.log("err in edit profile ", err);
            });
    } else {
        bcrypt
            .hash(req.body.password)
            .then((hashPwd) => {
                Promise.all([
                    db.updateUserwithPW(
                        req.body.first,
                        req.body.last,
                        req.body.email,
                        hashPwd,
                        req.session.user_id
                    ),
                    db.updateProfile(
                        req.body.age,
                        req.body.city,
                        req.body.url,
                        req.session.user_id
                    ),
                ]).then(() => {
                    res.redirect("/signers");
                });
            })
            .catch((err) => console.log("err in edit password:", err));
    }
});

/*
 ********************** -  Petition -  **********************
 */

app.get("/petition", (req, res) => {
    // has my user already signed the petition? -> check cookie
    // console.log("petitiion req.session;", req.session);
    // console.log("petitiion cookie id;", req.session.signatureId);

    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});

app.post("/petition", (req, res) => {
    // console.log("running POST / add-signature");
    // console.log("req.body: ", req.body);
    // console.log("req.session", req.session.user_id);
    db.addSigner(req.body.signature, req.session.user_id)
        .then((results) => {
            // step 1: id loggen
            // console.log("results addSigner", results);
            // console.log("results addSigner row", results.rows[0].id);
            // step 2: in eine variable speichern req.sessio.sigID
            req.session.signatureId = results.rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err in db.addSigner:", err);
            res.render("petition", {
                error: true,
            });
        });
});

/*
 ********************** -  Thanks -  **********************
 */

app.get("/thanks", (req, res) => {
    let dataUrl;

    db.getDataUrl(req.session.signatureId)
        .then((result) => {
            dataUrl = result.rows[0].signature;
        })
        .catch((err) => {
            console.log("Error in db.getDataURL", err);
        });

    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
        //     // if the user has signed obtain the user's signature from the db
        //     // and find out how many people have signed the petition
        db.countSigners().then((result) => {
            const countID = result.rows[0].count;
            console.log("signer result.rows", result.rows[0].count);

            res.render("thanks", {
                layout: "main",
                //signature
                url: dataUrl,
                //number of signers
                countID,
            });
        });
    }
});

app.post("/thanks", (req, res) => {
    db.deleteSignature(req.session.user_id).then(() => {
        req.session.signatureId = null;
        res.redirect("/petition");
    });
});

/*
 ********************** -  Delete Signature -  **********************
 */
app.post("/deleteSignature", (req, res) => {
    db.deleteSignature(req.session.user_id)
        .then(() => {
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("err in deleteSignature", err);
        });
});

/*
 ********************** -  Signers -  **********************
 */

app.get("/signers/", (req, res) => {
    // console.log("req.session signers", req.session);
    // console.log("req.body signers", req.body);

    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
        db.getSignersProfile()
            .then((result) => {
                // our actual data is to be found under the rows property
                // console.log("result.rows from getSignersProfile:", result.rows);

                const sendSigners = result.rows;

                res.render("signers", {
                    layout: "main",
                    sendSigners,
                });
            })
            .catch((err) => console.log("err in db.etSignersProfile:", err));
    }
});
app.get("/signers/:city", (req, res) => {
    let city = req.params.city.toLowerCase();

    db.getSignersCity(city)
        .then((result) => {
            console.log("result.rows from getSignersCity:", result.rows);

            const sendSigners = result.rows;

            res.render("signers", {
                layout: "main",
                sendSigners,
            });
        })
        .catch((err) => console.log("err in db.etSignersCity: ", err));
});

/*
 *********** -  Logout -  ***********
 */

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

/*
 *********** -  Extra -  ***********
 */

app.get("/button", (req, res) => {
    res.render("button");
});

app.get("/plants", (req, res) => {
    res.render("plants");
});

// app.listen(8080, () => console.log("you got the petition ♥︎"));
app.listen(process.env.PORT || 8080, () =>
    console.log("you got the petition ♥︎")
);
// console.log("process.env.PORT", process.env.PORT);

// /singers/:city
