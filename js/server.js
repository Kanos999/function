// The one and only server function
/*jshint esversion: 6 */



exports.server = function() {

	var express = require("express"),
		app = express(),
		mysql = require("mysql"),
		//cookie = require('cookie'),
		//md5 = require("md5"),
		port = 81;

	var pool = mysql.createPool({
		connectionLimit: 5,
		host: "localhost",
		user: "kane",
		password: "kanos999",
		database: "schoolPack",
		timezone: "utc"
	});

	function dbQuery(sql, callback) {
		pool.getConnection((err, connection) => {
			if (!err) {
				connection.query(sql, function(err, rows) {
					if (!err) {
						callback(null, rows);
					}
					else {
						callback(err);
					}
				});
				connection.release();
			}
		});
	}


	app.get("/profileManager", (req, res) => {
		var action = req.query.action,
			sql;

		switch (action) {
			case "checkProfile":
			sql = `SELECT * from profiles WHERE (username = '${req.query.emailOrUsername}' OR email = '${req.query.emailOrUsername}') AND password = '${req.query.password}'`;
			dbQuery(sql, function(err, rows) {
				var result = { passwordOk: false };
				if (rows.length) {
					result.passwordOk = true;
					res.cookie("username", rows[0].username);
					res.cookie("password", rows[0].password);
				}
				res.json(result);
			});
			break;

			case "addProfile":
			sql = `SELECT * from profiles WHERE username = '${req.query.username}' OR email = '${req.query.email}'`;
			dbQuery(sql, function(err, rows) {
				var result = { newUser: true };
				if (rows.length) {
					result.newUser = false;
				}
				else {
					sql = `INSERT INTO profiles (name, username, email, password, theme) VALUES ('${req.query.name}', '${req.query.username}', '${req.query.email}', '${req.query.password}', 3)`;
					dbQuery(sql, function(err, rows) {});
					res.cookie("username", req.query.username);
					res.cookie("password", req.query.password);
				}
				res.json(result);
			});
			break;

			case "changePassword":
			res.cookie("password", req.query.password);
			sql = `UPDATE profiles SET password = '${req.query.password}' WHERE username = '${req.query.username}'`;
			console.log(sql);
			dbQuery(sql, function(err, rows) {});
			res.json({passwordOk:true});
			break;
		}
	});



	app.get("/myPageManager", (req, res) => {
		var action = req.query.action,
			sql;

		switch (action) {
		case "getCategories":
			sql = `SELECT * from categories WHERE owner = '${req.query.username}'`;
			dbQuery(sql, function(err, rows) {
				res.json({
					rows: rows
				});
			});
			break;
		}

	});



	// Where static content is served from.
	app.use(express.static(__dirname + "/../static/", { index: "index.html" }));

	// Start server
	app.listen(port);
	console.log("Starting server on port", port);
};
