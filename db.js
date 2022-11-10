// below we have information that we need for out db connection
// // which db do we talk to?
// const database = "petition";
// // which user is running our queries in the db
// const username = "postgres";
// // what's the users password
// const password = "postgres";
// const db = spicedPg(`postgres:${username}:${password}@localhost:5432/${database}`);

const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL || "postgres:postgres:postgres@localhost/petition"
);
//console.log("[db] connecting to:", db);

module.exports.addSigner = (signature, user_id) => {
    console.log("[db]signature", signature, "[db]user_id", user_id);
    const q = `INSERT INTO signatures (signature, user_id)
                VALUES ($1, $2)
                RETURNING id`;
    const param = [signature, user_id];
    return db.query(q, param);
};

module.exports.registerUser = (first, last, email, passwd) => {
    console.log(
        "[db]lastname",
        last,
        "[db]firstname",
        first,
        "[db]email",
        email,
        "[db]passwd",
        passwd
    );
    const q = `INSERT INTO users ( first, last, email, passwd)
    VALUES ($1, $2, $3, $4)
    RETURNING id`;
    const param = [first, last, email, passwd];
    return db.query(q, param);
};

module.exports.registerProfile = (age, city, url, user_id) => {
    // console.log("register Profile a: c: url: user: ", age, city, url, user_id);
    const q = `INSERT INTO profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id`;
    const param = [age, city, url, user_id];
    return db.query(q, param);
};

// module.exports.getSignatures = () => {
//     return db.query(`SELECT signature FROM signatures`);
// };

module.exports.findSignature = (user_id) => {
    const q = `SELECT * 
                FROM signatures 
                WHERE user_id = $1`;
    const param = [user_id];
    return db.query(q, param);
};

module.exports.totalSignatures = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.countSigners = () => {
    return db.query(`SELECT COUNT(id) FROM signatures`);
};

module.exports.getDataUrl = (signatureId) => {
    const param = [signatureId];
    const q = `SELECT signature FROM signatures WHERE id = $1;`;
    return db.query(q, param);
    // return db.query(`SELECT signature FROM signatures WHERE id = $1;`, [
    //     signatureId,
    // ]);
};

module.exports.getEmail = (email) => {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};

module.exports.getUserId = (user_id) => {
    const q = `SELECT * FROM signatures WHERE user_id = $1`;
    const param = [user_id];
    return db.query(q, param);
};

module.exports.getCity = (city) => {
    const q = `SELECT * FROM profiles WHERE LOWER(city) = LOWER($1)`;
    const param = [city];
    return db.query(q, param);
};

module.exports.getSignersProfile = () => {
    return db.query(
        `SELECT users.first, users.last, profiles.age, profiles.city, profiles.url
        FROM users
        LEFT OUTER JOIN profiles
        ON users.id = profiles.user_id
        JOIN signatures
        ON users.id = signatures.user_id;  `
    );
};

module.exports.getSignersCity = (city) => {
    const q = `SELECT users.first, users.last, profiles.age, profiles.city, profiles.url
        FROM users
        LEFT OUTER JOIN profiles
        ON users.id = profiles.user_id
        JOIN signatures
        ON users.id = signatures.user_id
        WHERE LOWER(profiles.city) = LOWER($1);`;
    const param = [city];
    return db.query(q, param);
};

module.exports.getSignerProfileByID = (users_id) => {
    return db.query(
        `SELECT users.first, users.last, users.email, profiles.age, profiles.city, profiles.url
        FROM users
        LEFT OUTER JOIN profiles
        ON users.id = profiles.user_id
        JOIN signatures
        ON users.id = signatures.user_id
        WHERE users.id = $1;`,
        [users_id]
    );
};

module.exports.updateUserwithPW = (first, last, email, passwd, user_id) => {
    const q = `UPDATE users
               SET first=$1, last=$2, email=$3, passwd=$4
               WHERE id = $5;`;
    const param = [first, last, email, passwd, user_id];
    return db.query(q, param);
};

module.exports.updateUserwithoutPW = (first, last, email, user_id) => {
    const q = `
    UPDATE users 
    SET first=$1, last=$2, email=$3
    WHERE id = $4;`;
    const param = [first, last, email, user_id];
    return db.query(q, param);
};

module.exports.updateProfile = (age, city, url, user_id) => {
    const q = `
    INSERT INTO profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age=$1, city=$2, url=$3;`;
    const param = [age, city, url, user_id];
    return db.query(q, param);
};

module.exports.deleteSignature = (user_id) => {
    const q = `DELETE FROM signatures WHERE user_id = $1`;
    const param = [user_id];
    return db.query(q, param);
};

module.exports.deleteUser = (user_id) => {
    const q = `DELETE FROM users WHERE id = $1`;
    const param = [user_id];
    return db.query(q, param);
};

// INSERT => create or add or register
// SELECT => get

// update alles ausser passwort
//update alles ohme passwort
