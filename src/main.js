"use strict";

const UI = require('./UI');

(function () {
	document.addEventListener('DOMContentLoaded',() => {
	    let ui = new UI();
    	ui.createBoard();
    	ui.updatePos(); 
	},false);
})();