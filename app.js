var express = require('express'),
http = require('http'),
path = require('path'),
util = require('util'),
mongo = require('mongodb'),
monk = require('monk'),
mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL || 'localhost:27017/expenseapp',
db = monk(mongoUri);

process.env.TZ = 'America/New_York'; //Set default timezone

var app = express();

app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
	app.use(express.errorHandler());
});

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/expenses', function(req, res) {
	var collection = db.get("expenses");
	collection.find({}, {}, function(e, docs) {
		res.json(docs);
	});
});

app.post("/expense", function(req, res) {
	var expense = validateExpense(req.body);
	if (!expense.error) {
		var collection = db.get("expenses");
		collection.insert(expense,
			function (err, doc) {
				if (err) {
					res.json(500, {error: "There was an error adding your expense to the database. Please try again later."});
				} else {
					res.json(200, expense);
				}
			});
	}
});

app.delete("/expense/:expense_id", function(req, res) {
	var expense = db.get("expenses").remove({_id: req.params.expense_id}, {w: 1},
		function(err, doc) {
			res.json(doc);
		}
	);
});

function validateExpense(expense) {
	var d = new Date(expense.date);
	error = null;
	if (Object.prototype.toString.call(d) !== "[object Date]" || isNaN(d.getTime())) {
		error = "The date you provided is invalid.";
	} else if (isNaN(expense.amount)) {
		error = "The amount you provided is not numeric.";
	} else if (!expense.title || expense.title.length > 150 || expense.title.length < 3) {
		error = "The title must be between 3 and 150 characters long.";
	} else if (!expense.tags || expense.tags.length < 1 || expense.tags.length > 10) {
		error = "You must have at least 1 tag, with a maximum of 10.";
	}
	return error ? {"error": error} : expense;
}

http.createServer(app).listen(app.get('port'), function() {
	console.log("Express is listening on port " + app.get('port'));
});