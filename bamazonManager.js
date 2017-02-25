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
    promptMenu();
});

function promptMenu() {
	inquirer.prompt([
			{
			    type: 'rawlist',
			    message: "What do you want to do?",
			    choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
				name: "task",
		  	}
	]).then(function(task) {
		var task = task.task;
		console.log(task);
		toDo(task);
	});
}

function toDo(task) {
    switch (task) {
      case 'View Products for Sale':
      	displayItems();
        break;
      case 'View Low Inventory':
        lowInventory();
        break;
      case 'Add to Inventory':
        addInventory();
        break;
      case 'Add New Product':
        promptAdd();
    }
}

function displayItems() {
    connection.query('SELECT * FROM Products', function(err, data) {
        if (err) throw err;
        for (var i = 0; i < data.length; i++) {
        	console.log(data[i].item_id + " | " + data[i].product_name + " | " + data[i].price);
        }
    });
}

function lowInventory() {
	var query = 'SELECT * FROM Products WHERE stock_quantity < 5';
  	connection.query(query, function(err, data) {
    		for (var i = 0; i < data.length; i++) {
      			console.log(data[i].item_id + " | " + data[i].product_name + " | " + data[i].stock_quantity);
    		}
    });
}

function promptAdd() {
	inquirer.prompt([
			{
			    type: "input",
			    message: "Insert the ID of the new product",
			    name: "newItemID"
			},
			{
			    type: "input",
			    message: "Name of the new product",
			    name: "newProductName"
			},
			{
			    type: "input",
			    message: "Department",
			    name: "newDep"
			},
			{
			    type: "input",
			    message: "Price",
			    name: "newItemPrice"
			},
			{
			    type: "input",
			    message: "Amount of units",
			    name: "amount"
			} 
	]).then(function(add) {
		var newItem = new Item(add.newItemID, add.newProductName, add.newDep, add.newItemPrice, add.amount);
		writeData(newItem);
	});
}

function Item(item_id, product_name, department_name, price, stock_quantity) {
    this.item_id = item_id;
    this.product_name = product_name;
    this.department_name = department_name;
    this.price = price;
    this.stock_quantity = stock_quantity;
}

function writeData(newItem) {
	connection.query('INSERT INTO Products SET ?', [newItem], function(err, data) {
       console.log("Item Added");
    });
}

function addInventory() {
	connection.query('SELECT product_name FROM Products', function(err, data) {
        if (err) throw err;

        inquirer.prompt([
		        	{
		            name: "item_selected",
		            type: "rawlist",
		            message: "What item do you want to stock",
		            choices: function(value) {
				                var items = [];
				                for (var i = 0; i < data.length; i++) {
				                    items.push(data[i].product_name);
				                }
		                 return items;
		            	}
		            }
        ]).then(function(result) {
        	var stockUpdate = result.item_selected;
			console.log("You are about update: " + result.item_selected);
			inventoryUpdate(stockUpdate);
		});
	});
}

function inventoryUpdate(stockUpdate) {
	inquirer.prompt([
			{
			    type: "input",
			    message: "How many units do you want to add?",
			    name: "newStock"
			}
	]).then(function(update) {
			var addedQuantity = update.newStock;
			findItem(stockUpdate, addedQuantity);
    });
}

function findItem(stockUpdate, addedQuantity) {
	connection.query('SELECT * FROM Products WHERE product_name = ?', [stockUpdate], function(err, data) {
        if (err) throw err;
        console.log(data[0].stock_quantity);
        var quantityUpdate = Number(data[0].stock_quantity) + Number(addedQuantity);
        console.log(quantityUpdate);
        updateData(quantityUpdate, stockUpdate);
    });
}

function updateData(quantityUpdate, stockUpdate) {
	connection.query('UPDATE Products SET ? WHERE ?', [{stock_quantity: quantityUpdate}, {product_name: stockUpdate}], function(err, res){
	console.log("You added to " + stockUpdate);
	connection.end();
	});
};