firebase.initializeApp(firebaseConfig);
	
	function decrypt(encrypted, token) {
		let masterpass = sha256(token)
		return sjcl.decrypt(masterpass, encrypted)
	}
	
	function encrypt(decrypted, token) {
		let masterpass = sha256(token)
		return sjcl.encrypt(masterpass, decrypted)
	}

	var app = angular.module('jismeApp', ['firebase']);
	var user;
	
	app.controller('AuthCtrl', function($scope, $firebaseAuth) {
		var auth = $firebaseAuth();
		
		firebase.auth().onAuthStateChanged(function(firebaseUser) {
			if (firebaseUser) {
				$scope.user = firebaseUser;
			}
			else{
			  $scope.user = null;
			}
		});

		$scope.signIn = function() {
		  auth.$signInWithPopup('google').then(function(firebaseUser) {
			$scope.user = firebaseUser.user;
		  }).catch(function(error) {
			alert(error);
		  });
		};
		
		$scope.signOut = function () {
			auth.$signOut();
            location.reload();
		}
	  });
	  
	  app.filter('orderObjectBy', function() {
		  return function(items, field, reverse) {
			var filtered = [];
			
			angular.forEach(items, function(item) {
				filtered.push(item);
			});
			
			filtered.sort(function (a, b) {
			  return a[field].localeCompare(b[field]);
			});
			
			if(reverse) {
				filtered.reverse();
			}
				
			return filtered;
		  };
		});

        app.filter('distinctCategories', function() {
		  return function(items) {
			var filtered = [];
			var categories = [];
			
			angular.forEach(items, function(item) {
			  if (categories.indexOf(item.category) == -1) {
                  filtered.push(item);
				  categories.push(item.category);
              }
			});
			
			return filtered;
		  };
		});
	  
	  app.controller('AccountsCtrl', function ($scope, $firebaseArray) {
		$scope.user = null;

        $scope.currentDate = new Date().toLocaleDateString();
		$scope.currentCategory = 'All';
		
		firebase.auth().onAuthStateChanged(function(firebaseUser) {
			if (firebaseUser) {
				$scope.user = firebaseUser;
			  
				var accountsRef = firebase
					.database()
					.ref('users/' + $scope.user.uid + '/');
					
				//create a synchronized array
				$scope.accounts = $firebaseArray(accountsRef);
			}
			else{
				$scope.user = null;
				$scope.accounts = null;
			}
		});
		
		$scope.search = function () {
			var query = $scope.query;
			
			//Show only accounts correspondings to query or show all if query is empty
			$('.account-row').each(function () {
				var found = false;
				
				$(this).find('.account').each(function () {
					if ($(this).val().toUpperCase().indexOf(query.toUpperCase()) >= 0 || !query.length) {
						found = true;
					}
				});
			
				if (found) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
		}

        $scope.filterCategory = function (category) {
			//Show only accounts correspondings to selected category
			$('.account-row').each(function () {
				var found = false;
				
				$(this).find('.category').each(function () {
					if ($(this).val().toUpperCase().indexOf(category.toUpperCase()) >= 0 || category == 'All') {
						found = true;
					}
				});
			
				if (found) {
					$(this).show();
				} else {
					$(this).hide();
				}

				$scope.currentCategory = category;
			});
		}

        $scope.filterDate = function() {
            var currentDate = $scope.currentDate;
            
            $('.account-row').each(function () {
				var found = false;
				
				$(this).find('.created_date').each(function () {
                    var accountCreatedDate = new Date($(this).val());
					
					var selectedDate = new Date(currentDate);
					
					if (accountCreatedDate > selectedDate) {
						found = true;
					}
				});
			
				if (found) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
        }
		
		$scope.add = function () {
			var category = $scope.new_category;
			var platform = $scope.new_platform;
			var user = $scope.new_user;
			var password = $scope.new_password;
			
			var accountsRef = firebase
					.database()
					.ref('users/' + $scope.user.uid + '/');
			
			$firebaseArray(accountsRef).$add({
				category: category,
				platform: platform,
				user: user,
				password: password,
				created_date: Date()
			});
			
			//Empty fields
			$scope.new_category = null;
			$scope.new_platform = null;
			$scope.new_user = null;
			$scope.new_password = null;
		}

		$scope.save = function (account) {
			$scope.accounts.$save(account);
		}

		$scope.delete = function (account) {
			$scope.accounts.$remove(account);
		}
	  });