var app = angular.module("myPage", ["ngCookies"]);

app.controller("mainController", ["$scope", "$http", "$window", "$cookies", "$compile", function($scope, $http, $window, $cookies, $compile) {


	var chunksList,
		currentChunk,
		groupSelectorOpen = false,
		currentGroup = $cookies.get("username"),
		date = new Date(),
		daysList = [],
		movingCard = false,
		currentChunkSerial;

	var colors = [["#0078D7", "#0063B1"],
	["#F7630C", "#CA5010"],
	["#00B294", "#018574"],
	["#68768A", "#515C6B"]];
	var colorNames = ["blue", "orange", "green", "grey"];

	$scope.weeks = [];
	$scope.datesList = [];
	$scope.dayGenerator = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	$scope.monthGenerator = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];



	for(var i=1; i<=52; i++) {
		$scope.weeks.push({
			number: i
		});
	}

	getChunks();



	$("#welcomeText").append($cookies.get("username"));

	$(".dim").hide();
	$(".miniDim").hide();
	$("#dialogueBox").hide();
	$("#notesDropdown").hide();
	$("#header").append('<span class="next" id="myProfileLink" >' + $cookies.get("username") + '</span>');
	$("#searchBackButton").hide();
	$("#searchResults").hide();
	$("#createGroup").hide();
	$("#addCategoryButton").css({opacity: 0});
	$("#collaboratorsTable").hide();
	$("#dataTypesContainer").hide();
	$(".colorPalette").hide();
	$("#partsPanel").hide();
	$("#categoriesPanel").hide();
	$("#weekTable").hide();
	$("#doneTable").hide();
	$("#categoriesTable").hide();
	//$("#dropdownCategories").hide();


	$scope.editProfile = function() {
		window.location.href = "editProfile.html";
	};
	$scope.logOut = function() {
		window.location.href = "index.html";
	};


	$("#categoriesKey").hover(function(e) {
		if(e.type == "mouseenter") $("#addCategoryButton").animate({opacity: 1}, 200);
		else $("#addCategoryButton").animate({opacity: 0}, 195);
	});





	$(window).scroll(function() {
		var scrolled_val = $(document).scrollTop().valueOf();
		if(scrolled_val >= 46) {
			$("#packageListContainer").css({"position": "fixed", "top": "-46"}, 200);
			$("#functionalityContainer").css({"position": "fixed", "top": "-46"}, 200);
		} else {
			$("#packageListContainer").css({"position": "absolute", "top": "0"}, 200);
			$("#functionalityContainer").css({"position": "absolute", "top": "0"}, 200);
		}
	});


	$("#searchBarContainer").click(function() {
		$("#header").css({"height": "100%", "background-color": "#EEEEEE"}, 100);
		$("#myProfileLink").fadeOut(195);
		$("#logo").fadeOut(195);
		$("#searchBackButton").slideDown(225);
		$("#searchResults").slideDown(225);
		$("#searchBar").addClass("searchBarCenter");
		$("#searchBar").css({
			"width": "50%",
			"left": "25%",
		}, 300);


		$("#searchBackButton").click(function() {
			$("#header").css({"height": "46"}, 100);
			$("#logo").fadeIn(225);
			$("#myProfileLink").fadeIn(225);
			$("#searchBackButton").hide(225);
			$("#searchResults").slideUp(195);
			$("#searchBar").removeClass("searchBarCenter");
			$("#searchBar").css({
				"width": "320",
				"left": "120",
			}, 200);
			getTheme();
		});

		var params = {
			action: "getSearchResults",
			username: $cookies.get("username"),
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.peopleSearchBox = res.data.profiles;
			$scope.chunksSearchBox = res.data.chunks;
			$scope.foldersSearchBox = res.data.folders;
			$scope.notesSearchBox = res.data.notes;
		}, function() {
			// failure
			console.log("FAIL");
		});
	});




	$scope.hideAll = function() {
		$("#addFolder").slideUp(195, function() {
			getFolders();
		});
		$("#partsPanel").slideUp(195);
		$("#partsPanel").removeClass("partsPanelSelected");
		$("#categoriesPanel").slideUp(195);
		$("#categoriesPanel").removeClass("categoriesPanelSelected");
		$("#addNote").slideUp(195);
		$("#addChunk").slideUp(195);
		$("#addChunkDialogue").slideUp(195);
		$("#eventInfoTab").fadeOut(195);
		$("#welcome").fadeOut(195);
		$("#chunkingTable").slideUp(195);
		$("#tasksList").slideUp(195);
		$("#taskFabButton").fadeOut(195);
		$("#taskGridViewButton").fadeOut(195);
		$("#taskListViewButton").fadeOut(195);
		$("#tasks").stop().animate({left: "0"}, 195);
		$("#addTaskDialogue").stop().animate({left: "100%"}, 195);
		$("#addChunk").hide();
		$(".colorPalette").hide();
		$("#createGroup").slideUp(195);
		$("#collaboratorsTable").hide();
	};

	$scope.showOrganisationPage = function() {
		$("#welcome").fadeOut(195);
		$("#collaboratorsTable").fadeOut(195);
		$(".organisationHeaderButton").slideDown(225);

		var params = {
			action: "getAllOrganisation",
			username: $cookies.get("username")
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.folders = res.data.rows;
		}, function() {
			// failure
		});
	};

	$scope.showCollaboratorsPage = function() {
		$("#welcome").fadeOut(195);
		$(".organisationHeaderButton").slideUp(195);

		$("#collaboratorsTable").fadeIn(225);

		var params = {
			action: "getCollaborators",
			username: $cookies.get("username"),
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			console.log(res.data.rows);
			//success
			$scope.collaborators = res.data.rows;
		}, function() {
			// failure
		});
	};

	getTheme();

	$scope.changeColor =  function(color) {
		var params = {
			action: "updateTheme",
			username: $cookies.get("username"),
			color: color
		};
		$http.get("profileManager", { params: params }).then(function(res) {
			//success
			if(res.data.success) {
				getTheme();
				document.querySelector('#actionSnackbar').MaterialSnackbar.showSnackbar({
					message: "Changed theme to " + colorNames[color],
				});
			}
		}, function() {
			// failure
		});
	};

	function getTheme() {
		var params = {
			action: "getTheme",
			username: $cookies.get("username"),
		};
		$http.get("profileManager", { params: params }).then(function(res) {
			//success
			$("#header").css({ "background-color": colors[res.data.rows[0].theme][0] }, 200);
			$("#functionalityContainer").css({ "background-color": colors[res.data.rows[0].theme][1] }, 200);
		}, function() {
			// failure
		});
	}





	$("#groupSelector").click(function() {
		if(groupSelectorOpen) {
			$(".colorPalette").fadeOut(200, function() {
				$(".avatar").fadeIn(200);
			});
			groupSelectorOpen = false;
		} else {
			$(".avatar").fadeOut(200, function() {
				$(".colorPalette").fadeIn(200);
			});
			groupSelectorOpen = true;

		}
	});

	$scope.createGroup = function() {
		$("#createGroup").slideDown(225);
		$(".dim").fadeIn(225);
	};

	$scope.selectGroup = function(index) {

	};


	$scope.dialogue = function(dialogue) {
		$("#dialogueInputs").html("");
		$("#dialogueBox").fadeIn(225, function() {
			$(".dialogueContentFade").show(100);
		});
		$("#dialogueBox").addClass("dialogueBoxOpened");

		switch(dialogue) {
			case "chunk":
			$scope.currentAction = "addChunk";

			$(".datePicker").val(new Date($scope.selectedDate));
			$(".dim").fadeIn(225);
			$("#dialogueBox").slideDown(225);
			$("#dialogueTitle").html("Add a Chunk");
			$("#dialogueInputs").append($compile("<input type='text' ng-model='chunkTitleInput' class='mdl-textfield__input' placeholder='New Chunk Name' />")($scope));
			$("#dialogueInputs").append($compile("<input type='date' class='datePicker' ng-model='chunkDateInput' ng-bind='selectedDate' />")($scope));

			break;

			case "category":
			$scope.currentAction = "addCategory";
			$(".dim").fadeIn(225);
			$("#dialogueBox").slideDown(225);
			$("#dialogueTitle").html("Add a Category");
			$("#dialogueInputs").append($compile("<input type='text' ng-model='categoryNameInput' class='mdl-textfield__input' placeholder='New Category Name' />")($scope));
			$("#dialogueInputs").append($compile("<input type='color' ng-model='categoryColorInput' class='mdl-textfield__input' />")($scope));
			break;
		}
	};

	$scope.hideDialogueBox = function() {
		$(".dim").fadeOut(195);
		$(".miniDim").fadeOut(195);
		$("#dialogueBox").fadeOut(195);
		$(".dialogueContentFade").hide(195, function() {
			$("#dialogueBox").removeClass("dialogueBoxOpened");
		});
		$("#partsPanel").fadeOut(195);
		$("#partsPanel").removeClass("partsPanelSelected");
		$("#categoriesPanel").fadeOut(225);
		$("#categoriesPanel").removeClass("categoriesPanelSelected");
	};

	$scope.submitButton = function() {
		$scope.hideDialogueBox();
		var params,
		thingo;

		switch($scope.currentAction) {
			case "addChunk":
			thingo = "Chunk";
			params = {
				action: "addChunk",
				username: $cookies.get("username"),
				title: $scope.chunkTitleInput,
				date: addDay($scope.chunkDateInput)
			};
			break;

			case "addCategory":
			thingo = "Category";
			params = {
				action: "addCategory",
				username: $cookies.get("username"),
				title: $scope.categoryNameInput,
				color: $scope.categoryColorInput
			};
			break;
		}

		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			if(res.data.successYes == "addChunk") getChunks();
			if(res.data.successYes == "addCategory") getCategories();
		}, function() {
			// failure
		});

		document.querySelector('#actionSnackbar').MaterialSnackbar.showSnackbar({
			message: thingo + " successfully added",
		});
	};


	$scope.showNotesSection = function() {
		$("#notesDropdown").slideDown(225);
		$("body").css({position: "fixed"});
	};

	$scope.selectDay = function(date) {
		$scope.selectedDate = new Date(date);
	};



	function getChunks() {
		daysList = [];
		for(var dayOfYear = 1; dayOfYear < 365; dayOfYear++) {
			daysList.push([{date: new Date(date.getFullYear(), 0, dayOfYear)}]);
		}

		var params = {
			action: "getChunks",
			username: $cookies.get("username")
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			sortChunks(res.data.rows);
			$scope.showWeek = function(weekNumber) {
				$("#daysTable").animate({scrollTop: $("#Monday" + weekNumber).position().top + 40}, 600, 'swing');
			};
			//console.log($("#Monday" + getWeekNumber(new Date())).offset().top);
			//$scope.showWeek(getWeekNumber(new Date()));
		}, function() {
			// failure
		});
	}

	function sortChunks(chunkList) {
		chunkList.forEach(function(element) {
			var start = new Date(date.getFullYear(), 0, 1);
			var diff = new Date(element.date) - start;
			var oneDay = 1000 * 60 * 60 * 24;
			var dayOfYear = Math.floor(diff / oneDay);

			daysList[dayOfYear].push(element);
		});
		$scope.daysTable = daysList;
	}

	$( document ).on( "mousemove", function( event ) {
		$("#selectedMovedCard").css({
			"left": event.pageX,
			"top": event.pageY
		});
	});

	$scope.chunkMouseDown = function(chunk) {
		$scope.movingCard = true;
		currentChunkSerial = chunk.serial;
		$("#chunkCard" + chunk.serial).addClass("movedCard");
		$("#selectedMovedCard").html($("#chunkCard" + chunk.serial).html());

	};

	$scope.chunkMouseUp = function(currentRow) {
		if($scope.movingCard) {
			var params = {
				action: "modifyChunk",
				username: $cookies.get("username"),
				serial: currentChunkSerial,
				date: addDay(currentRow)
			};
			$http.get("myPageManager", { params: params }).then(function(res) {
				//success
				getChunks();
			}, function() {
				// failure
			});
			$scope.movingCard = false;
		}
	};


	function addDay(thisDate) {
		return new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate() + 1);
	}





	$scope.getWeekId = function(date) {
		return $scope.dayGenerator[date.getDay()] + getWeekNumber(date);
	};

	function getWeekNumber(d) {
	    // Copy date so don't modify original
	    d = new Date(+d);
	    d.setHours(0,0,0,0);
	    // Set to nearest Thursday: current date + 4 - current day number
	    // Make Sunday's day number 7
	    d.setDate(d.getDate() + 4 - (d.getDay()||7));
	    // Get first day of year
	    var yearStart = new Date(d.getFullYear(),0,1);
	    // Calculate full weeks to nearest Thursday
	    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
	    // Return array of year and week number
	    return weekNo;
	}





	$scope.showPartsPanel = function(taskSerial) {
		console.log(taskSerial);
		$(".dim").fadeIn(225);
		$("#partsPanel").slideDown(225);
		$("#partsPanel").addClass("partsPanelSelected");

	};

	$scope.markChunkAsDone = function(serial) {
		var params = {
			action: "markChunkDone",
			username: $cookies.get("username"),
			chunkSerial: serial
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			getChunks();
		}, function() {
			// failure
		});
	};

	$scope.showTasksContainer = function() {
		$(".miniDim").fadeIn(225);
		$("#organisationContainer").animate({left: "16%"}, 200);
		$("#tasksListContainer").animate({left: "60%"}, 200);

		var params = {
			action: "getTasks",
			username: $cookies.get("username")
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.tasksList = res.data.rows;
		}, function() {
			// failure
		});
	};

	$scope.showDropdownCategories = function(chunkSerial, chunkTitle) {
		$(".dim").fadeIn(225);
		$("#categoriesPanel").slideDown(225);
		$("#categoriesPanel").addClass("categoriesPanelSelected");
		getCategories();
		$scope.currentChunk = chunkTitle;
		$scope.currentSerial = chunkSerial;
	};

	$scope.addChunkToCategory = function(color) {
		console.log(color);
		var params = {
			action: "addChunkToCategory",
			serial: $scope.currentSerial,
			color: color,
			username: $cookies.get("username")
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.hideDialogueBox();
			getChunks();
		}, function() {
			// failure
		});
	};





	$("#daysBreadcrumbs").html('<a class="breadcrumb">Viewing</a>');
	$("#daysBreadcrumbs").append('<a class="breadcrumb">Weekly Planner</a>');
	$scope.currentViewModel = function(view) {
		$("#daysBreadcrumbs").html('<a class="breadcrumb">Viewing</a>');
		$("#daysTable").hide();
		$("#weekTable").hide();
		$("#doneTable").hide();
		$("#categoriesTable").hide();
		switch(view) {
			case "all":
			$("#daysBreadcrumbs").append('<a class="breadcrumb">Weekly Planner</a>');
			$("#daysTable").fadeIn(200);
			break;

			case "week":
			$("#daysBreadcrumbs").append('<a class="breadcrumb">Upcoming Tasks</a>');
			$("#weekTable").fadeIn(200);
			getChunksThisWeek();
			break;

			case "done":
			$("#daysBreadcrumbs").append('<a class="breadcrumb">Completed Tasks</a>');
			$("#doneTable").fadeIn(200);
			getDoneChunks();
			break;

			case "categories":
			$("#daysBreadcrumbs").append('<a class="breadcrumb">Categories</a>');
			$("#categoriesTable").fadeIn(200);
			getCategories();
			break;
		}
	};


	function getChunksThisWeek() {
		$scope.chunksThisWeek = [];
		var thisWeek = new Date();
		var nextWeek = new Date(thisWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

		var params = {
			action: "getTasksCurrentWeek",
			username: $cookies.get("username")
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			res.data.rows.forEach(function(chunk) {
				//console.log(chunk.date, thisWeek);
				if(new Date(chunk.date) >= thisWeek && new Date(chunk.date) <= nextWeek) {
					$scope.chunksThisWeek.push(chunk);
				}
			});
			//$scope.tasksList = thisWeekChunks;
		}, function() {
			// failure
		});
	}


	function getDoneChunks() {
		var params = {
			action: "getDoneChunks",
			username: $cookies.get("username")
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.doneChunks = res.data.rows;
		}, function() {
			// failure
		});
	}



	function getCategories() {
		var params = {
			action: "getCategories",
			username: $cookies.get("username")
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.categories = res.data.rows;
			$scope.categoriesDropdown = res.data.rows;
		}, function() {
			// failure
		});
	}



}]);





app.controller("notesController", ["$scope", "$http", "$window", "$cookies", "$compile", function($scope, $http, $window, $cookies, $compile) {

	var currentNote = -1,
		currentPage = -1,
		currentFolder = -1,
		currentFolderName,
		isDragging = false,
		mousePos = {
			x: 0,
			y: 0
		};
	getFolders();
	$("#notesDropdown").hide();

	$scope.showFolders = function() {
		console.log("here");
		$("#notesDropdown").slideDown(225);
		$("body").css({position: "fixed"});
	};
	$scope.closeFolders = function() {
		$("#notesDropdown").slideUp(195);
		$("body").css({position: "absolute"});
	};

	function getFolders() {
		var params = {
			action: "getFolders",
			username: $cookies.get("username")
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.folders = res.data.rows;
		}, function() {
			// failure
		});
	}

	$scope.getNotes = function(folderSerial, index) {
		currentFolderName = folderSerial;
		$(".folderList").css({"box-shadow": ""});
		$("#folder" + index).css({"box-shadow": "inset 0 1px 6px rgba(0, 0, 0, 0.4)"});
		var params = {
			action: "getNotes",
			username: $cookies.get("username"),
			folder: folderSerial
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.notes = res.data.rows;
		}, function() {
			// failure
		});
	};

	function getNotes(folderName) {
		var params = {
			action: "getNotes",
			username: $cookies.get("username"),
			folder: folderName
		};
		//console.log(params);
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.notes = res.data.rows;
		}, function() {
			// failure
		});
	}



	$scope.removeFolder = function(folderSerial) {
		var handler = function() {
			var params = {
				action: "addFolder",
				username: $cookies.get("username"),
				folder: folderSerial
			};
			$http.get("myPageManager", { params: params }).then(function(res) {
				//success
				getFolders();
			}, function() {
				// failure
			});
			getFolders();
		};
		document.querySelector('#deletedFolder').MaterialSnackbar.showSnackbar({
			message: "Folder Moved to Bin",
			actionHandler: handler,
			actionText: "undo"
		});

		var params = {
			action: "removeFolder",
			username: $cookies.get("username"),
			folder: folderSerial
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			getFolders();
		}, function() {
			// failure
		});
	};

	$scope.removeNote = function(index) {
		document.querySelector('#deletedNote').MaterialSnackbar.showSnackbar({
			message: "Note Moved to Bin"
		});
		$("#note" + index).animate({ opacity: 0 }, 400, function() {
			getNotes(currentFolderName);
		});
		currentNote = index;
		var params = {
			action: "removeNote",
			serial: $scope.notes[index].serial
		};
		//console.log(params);
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
		}, function() {
			// failure
		});
	};



	function modifyNote(serial, x, y, content) {
		var params = {
			action: "modifyNotes",
			x: x,
			y: y,
			content: content,
			serial: serial
		};
		//console.log(params);
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
		}, function() {
			// failure
		});
	}

	$scope.noteMouseDown = function(index, event) {
		mousePos.x = event.pageX;
		mousePos.y = event.pageY;
		currentNote = index;
		isDragging = true;
		for (var i = 0; i < $scope.notes.length; i++) {
			$("#note" + i).css({'z-index': i === index ? 1 : 0, "box-shadow": (i === index ? "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)" : "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)") }, 200);
		}
	};

	$scope.noteMove = function(event) {
		if (isDragging && currentNote >= 0) {
			$("#note" + currentNote).css({
				left: "+=" + (event.pageX - mousePos.x),
				top: "+=" + (event.pageY - mousePos.y)
			}, 4000);
			mousePos.x = event.pageX;
			mousePos.y = event.pageY;
		}
	};

	$scope.noteUpdatePosition = function() {
		$(".note").css({ "box-shadow": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)" }, 200);
		if (!isDragging){
			return;
		}

		isDragging = false;
		var pos = $("#note" + currentNote).offset();
		var sendContent = $scope.notes[currentNote].content.replace(/\n/g, "\\n");

		if(pos.top < 55 && currentNote >= 0) {
			modifyNote($scope.notes[currentNote].serial, pos.left, 70, sendContent);
			currentNote = -1;
			getNotes(currentFolderName);
		}
		else if (pos.left < 370 && currentNote >= 0) {
			modifyNote($scope.notes[currentNote].serial, 370, pos.top, sendContent);
			currentNote = -1;
			getNotes(currentFolderName);
		}

		else if (currentNote >= 0) {
			modifyNote($scope.notes[currentNote].serial, pos.left, pos.top, sendContent);
			currentNote = -1;
		}
	};


	$scope.noteContentChange = function(index) {
		currentNote = index;
		var sendContent = $scope.notes[currentNote].content.replace(/\n/g, "\\n");
		var pos = $("#note" + currentNote).offset();
		modifyNote($scope.notes[currentNote].serial, pos.left, pos.top, sendContent);
	};







	$scope.dialogue = function(dialogue) {
		$(".notesDim").fadeIn(225);
		$("#notesDialogueInputs").html("");
		$("#notesDialogueBox").fadeIn(225, function() {
			$(".dialogueContentFade").show(100);
		});
		$("#notesDialogueBox").addClass("dialogueBoxOpened");

		switch(dialogue) {
			case "folder":
			$scope.currentAction = "addFolder";
			$("#notesDialogueBox").slideDown(225);
			$("#notesDialogueTitle").html("Add a Folder");
			$("#notesDialogueInputs").append($compile("<input type='text' ng-model='newTitle' class='mdl-textfield__input' placeholder='New Folder Name' />")($scope));

			break;

			case "note":
			$scope.currentAction = "addNote";
			$("#notesDialogueBox").slideDown(225);
			$("#notesDialogueTitle").html("Add a Note");
			$("#notesDialogueInputs").append($compile("<input type='text' ng-model='newTitle' class='mdl-textfield__input' placeholder='New Note Name' />")($scope));
			break;
		}
	};


	$(".notesDim").hide();
	$("#notesDialogueBox").fadeOut(195);
	$(".dialogueContentFade").hide(195, function() {
		$("#notesDialogueBox").removeClass("dialogueBoxOpened");
	});

	$scope.hideDialogueBox = function() {
		$(".notesDim").fadeOut(195);
		$("#notesDialogueBox").fadeOut(195);
		$(".dialogueContentFade").hide(195, function() {
			$("#notesDialogueBox").removeClass("dialogueBoxOpened");
		});
	};


	$scope.submitButton = function() {
		$scope.hideDialogueBox();
		var params = {
			action: $scope.currentAction,
			username: $cookies.get("username"),
			header: $scope.newTitle,
			folder: currentFolderName
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			if(res.data.successYes) {
				switch($scope.currentAction) {
					case "addFolder": getFolders(); break;
					case "addNote": getNotes(currentFolderName); break;
				}
			}
		}, function() {
			// failure
		});
	};


}]);
