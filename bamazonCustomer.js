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
		var itemID = buy.itemID;
		var itemAmount = buy.amount;
		getProduct(itemID, itemAmount);
	});
	
	
}

function getProduct(itemID, itemAmount) {
	connection.query('SELECT item_id, stock_quantity FROM Products WHERE item_id = ?', [itemID], function(err, data) {
        if (err) throw err;
        var quantity = data[0].stock_quantity;
        checkQuantity(quantity, itemAmount)              
    });
}

function checkQuantity(quantity, itemAmount) {
	if (itemAmount > quantity) {
		console.log("Insufficient quantity!");
	} else {
		console.log("Order Placed");
	}
	connection.end();
}
// connection.end();
