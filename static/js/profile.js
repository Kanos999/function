var app = angular.module("profilePage", ["ngCookies", "angular-md5"]); //

app.controller("profilePageController", ["$scope", "$http", "$window", "$cookies", "md5", function($scope, $http, $window, $cookies, md5) {
//app.controller("profilePageController", ["$scope", "$http", "$window", "md5", function($scope, $http, $window, md5) {



	var userType = "student";
	var signupButtonX = $(".boxHeader").offset().left - $("#signupButton").outerWidth()/2 + $(".boxHeader").outerWidth();
	var signupButtonY = $(".boxHeader").offset().top - $("#signupButton").outerHeight()/2 + $(".boxHeader").outerHeight();

	var loginButtonX = $(".boxHeader2").offset().left - $("#loginButton").outerWidth()/2 + $(".boxHeader2").outerWidth();
	var loginButtonY = $(".boxHeader2").offset().top - $("#loginButton").outerHeight()/2 + $(".boxHeader2").outerHeight();


	$("#signup").hide();
	$("#loginButton").hide();


	$("#signupButton").css({ "left": signupButtonX, "top": signupButtonY });
	$("#loginButton").css({ "left": loginButtonX, "top": loginButtonY });

	$(window).resize(function() {
		signupButtonX = $(".boxHeader").offset().left - $("#signupButton").outerWidth()/2 + $(".boxHeader").outerWidth();
		signupButtonY = $(".boxHeader").offset().top - $("#signupButton").outerHeight()/2 + $(".boxHeader").outerHeight();
		$("#signupButton").css({ "left": signupButtonX, "top": signupButtonY });

		loginButtonX = $(".boxHeader2").offset().left - $("#loginButton").outerWidth()/2 + $(".boxHeader2").outerWidth();
		loginButtonY = $(".boxHeader2").offset().top - $("#loginButton").outerHeight()/2 + $(".boxHeader2").outerHeight();
		$("#loginButton").css({ "left": loginButtonX, "top": loginButtonY });
	});

	$("#signupButton").click(function() {
		$("#login").slideUp(200);
		$("#signup").slideDown(200);
		$("#loginButton").fadeIn(200);
		$("#signupButton").fadeOut(200);
	});
	$("#loginButton").click(function() {
		$("#signup").slideUp(200);
		$("#login").slideDown(200);
		$("#signupButton").fadeIn(200);
		$("#loginButton").fadeOut(200);
	});


	$scope.loginSubmit = function () {
		if(!$scope.emailOrUsername || !$scope.loginPassword) {
			alert("Please enter a Password");
			return;
		}

		var params = {
			action: "checkProfile",
			emailOrUsername: $scope.emailOrUsername,
			password: md5.createHash($scope.loginPassword)
		};

		$http.get("profileManager", { params: params }).then(function(res) {
			// success
			if (res.data.passwordOk) {
				console.log("Correct Password");
				window.location.href = "main.html";
			}
			else {
				alert("Incorrect Username/Password");
			}
		}, function() {
			// failure
		});
	};


	$scope.signupSubmit = function () {
		if(!$scope.name || !$scope.username || !$scope.email || !$scope.password) {
			alert("bad stuff");
			return;
		}

		var params = {
			action: "addProfile",
			name: $scope.name,
			username: $scope.username,
			email: $scope.email,
			password: md5.createHash($scope.password)
		};
		//console.log(params);
		$http.get("profileManager", { params: params }).then(function(res) {
			//success
			if (res.data.newUser) {
				window.location.href = "main.html";
			}
			else {
				alert("Username/Email already in use!");
			}
		}, function() {
			// failure
		});
	};





	$scope.changePassword = function() {
		if(md5.createHash($scope.oldPassword) === $cookies.get("password")) {
			console.log("yo im here");
			var params = {
				action: "changePassword",
				username: $cookies.get("username"),
				password: md5.createHash($scope.newPassword)
			};
			//console.log(params);
			$http.get("profileManager", { params: params }).then(function(res) {
				//success
				if(res.data.passwordOk) {
					window.location.href = "myPage.html";
					console.log("going back");
				}

			}, function() {
				// failure
			});
		}
	};
	$scope.backToMainPage = function() {
		window.location.href = "myPage.html";
	};



}]);
