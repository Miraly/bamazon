var itemID;

var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: "root",
    database: 'Bamazon'
});

connection.connect(function(err) {
    if (err) throw err;
    displayItems()
    
});

function displayItems() {
    connection.query('SELECT * FROM Products', function(err, data) {
        if (err) throw err;
        for (var i = 0; i < data.length; i++) {
        	console.log(data[i].item_id + " | " + data[i].product_name + " | " + data[i].price);
        };
    	promptUser();
    });
    
};

function promptUser() {
	inquirer.prompt([
			{
			    type: "input",
			    message: "Insert the ID of the product you would like to buy",
			    name: "itemID"
			},
			{
			    type: "input",
			    message: "How many units of the product you would like to buy?",
			    name: "amount"
			} 
	]).then(function(buy) {
		itemID = buy.itemID;
		var itemAmount = buy.amount;
		getProduct(itemID, itemAmount);
	});
};

function getProduct(itemID, itemAmount) {
	connection.query('SELECT item_id, stock_quantity, product_name, price FROM Products WHERE item_id = ?', [itemID], function(err, data) {
        if (err) throw err;
        var quantity = data[0].stock_quantity;
        var product = data[0].product_name;
        var price = data[0].price;
        checkQuantity(quantity, itemAmount, product, price);              
    });
};

function checkQuantity(quantity, itemAmount, product, price) {
	if (itemAmount > quantity) {
		console.log("Insufficient quantity!");
	} else {
		var quantityUpdate = quantity - itemAmount;
		updateData(quantityUpdate, itemID);
		order(itemAmount, product, price);
	}
	
};

function updateData(quantityUpdate, itemID) {
	connection.query('UPDATE Products SET ? WHERE ?', [{stock_quantity: quantityUpdate}, {item_id: itemID}], function(err, res){
	connection.end();
	});
};

function order(itemAmount, product, price) {
	console.log("Total amount: " + (itemAmount * price));
	console.log("Your order of " + product + " is on its way!");
};


