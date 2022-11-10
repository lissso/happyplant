DROP TABLE IF EXISTS signatures;
CREATE TABLE signatures (
       id SERIAL PRIMARY KEY,
       signature VARCHAR, -- NOT NULL CHECK (signature != '')
       user_id INT NOT NULL UNIQUE REFERENCES users(id) -- user_id INT REFERENCES user(id): proper way but more diifficult if you want to delete      
);


DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       first VARCHAR NOT NULL CHECK (first != ''),
       last VARCHAR NOT NULL CHECK (last != ''),
       email VARCHAR NOT NULL UNIQUE CHECK (email != ''),
       passwd VARCHAR NOT NULL CHECK (passwd != '')
);


CREATE TABLE IF EXISTS profiles;
CREATE TABLE profiles (
       id SERIAL PRIMARY KEY,
       age INT,
       city VARCHAR,
       url VARCHAR,
       user_id INT NOT NULL UNIQUE REFERENCES users(id)
);



-- --INNER JOIN : JOIN
-- -- ids missing
-- SELECT singer.name AS singer_name, songs.name AS song_name
-- FROM singers
-- JOIN songs

-- -- outer JOIN: left or rright join or full join to be more specific 
-- -- visulaize the tables, left table selecting from, right joining
-- -- left join: .....

-- INSERT INTO actors (name, age, oscars)
-- VALUES ('Ingrid', 63, 1)
-- ON CONFLICT (name)
-- DO UPDATE SET age=67, oscars=4;

-- ON actors.id = films.acttors.id;