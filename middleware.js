// app.use((req, res, next) => {
//     if (!req.session.userId && req.url != "/login" && req.url != "/register") {
//         res.redirect("register");
//     } else {
//         next();
//     }
// });
// app.use("/whatever", (req, res) => {
//     if (req.session.userID) {
//         res.redirect("petition");
//     } else {
//         next();
//     }
// });
// let requireLogout =(req,res, next) => {
//     if (req.session.userID) {
//         res.redirect("petition");
//     } else {
//         next();
//     }
// }
// //logout
// let requireSignedPetition = (req, res, next) => {
//     if (!req.session.userID) {
//         res.redirect("petition");
//     } else {
//         next();
//     }
// }
// let requireUnsignedPetition = (req, res, next) => {
//     if (req.session.signatureId) {
//         res.redirect("petition");
//     } else {
//         next();
//     }
// }
// app.get('register', rquireLogout, (req, res) => )

// //////------------------ server.js
// const app = export.app = express();
// // require in the spot where i want it to haappen
// app.use(requireLoggedIN)
// require('/auth-routes.js');

// //////------------------ auth-routes.js
// const app = require('/server.js')
// ///////
// app.use('profile', profile-routes.js)
// const express = require('express');
