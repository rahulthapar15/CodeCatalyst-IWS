(function($) {

	var settings = {

		// Parallax background effect?
			parallax: true,

		// Parallax factor (lower = more intense, higher = less intense).
			parallaxFactor: 20

	};

	skel.breakpoints({
		xlarge: '(max-width: 1800px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)'
	});

	$(function() {

		var $window = $(window),
			$body = $('body'),
			$header = $('#header'),
			$footer = $('#footer'),
			$main = $('#main');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				$body.removeClass('is-loading');
			});

		// Touch?
			if (skel.vars.mobile) {

				// Turn on touch mode.
					$body.addClass('is-touch');

				// Height fix (mostly for iOS).
					window.setTimeout(function() {
						$window.scrollTop($window.scrollTop() + 1);
					}, 0);

			}

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});

		// Footer.
			skel.on('+medium', function() {
				$footer.insertAfter($main);
			});

			skel.on('-medium !medium', function() {
				$footer.appendTo($header);
			});

		// Header.

			// Parallax background.

				// Disable parallax on IE (smooth scrolling is jerky), and on mobile platforms (= better performance).
					if (skel.vars.browser == 'ie'
					||	skel.vars.mobile)
						settings.parallax = false;

				if (settings.parallax) {

					skel.on('change', function() {

						if (skel.breakpoint('medium').active) {

							$window.off('scroll.strata_parallax');
							$header.css('background-position', 'top left, center center');

						}
						else {

							$header.css('background-position', 'left 0px');

							$window.on('scroll.strata_parallax', function() {
								$header.css('background-position', 'left ' + (-1 * (parseInt($window.scrollTop()) / settings.parallaxFactor)) + 'px');
							});

						}

					});

					$window.on('load', function() {
						$window.triggerHandler('scroll');
					});

				}

		// Main Sections: Two.

			// Lightbox gallery.
				$window.on('load', function() {

					$('#two').poptrox({
						caption: function($a) { return $a.next('h3').text(); },
						overlayColor: '#2c2c2c',
						overlayOpacity: 0.85,
						popupCloserText: '',
						popupLoaderText: '',
						selector: '.work-item a.image',
						usePopupCaption: true,
						usePopupDefaultStyling: false,
						usePopupEasyClose: false,
						usePopupNav: true,
						windowMargin: (skel.breakpoint('small').active ? 0 : 50)
					});

				});

	});

})(jQuery);

// --------------------------------------------------

$(document).ready(function () {
	$('#logout').hide();
	$("#uploadBtn").hide();
	$(".upload-group").hide();

});


//FIREBASE AUTHENTICATION
var provider = new firebase.auth.GoogleAuthProvider();
var user;

//Sign In Using Firebase
function SignIn(){
	console.log("Sign in clicked button");

	firebase.auth().signInWithPopup(provider).then(function (result) {
		// This gives you a Google Access Token. You can use it to access the Google API.
		var token = result.credential.accessToken;
		// The signed-in user info.
		user = result.user;
		showUserProfile();
		console.log(user.displayName);
		console.log("User :"+ user.uid);
		// ...
	}).catch(function (error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// The email of the user's account used.
		var email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		var credential = error.credential;
		// ...
	});
	// //Get value of default status and set to firebase
	// var pStatus = document.getElementByName('aboutUser').value;
	// console.log(pStatus);

};

function showUserProfile(){
	$('#codecatalyst').hide();
	$('#welcome').show(3000);
	// $('#username').html("Welcome,<strong>"+user.displayName+"</strong>");
	$('#welcome').html("<a class='image avatar'><img src="+user.photoURL+"alt='' /></a><h1>Welcome,<br><strong>"+user.displayName +"</strong></h1><br><br> \
			<section> \
				<form method='post' action='#'> \
					<div class='row uniform 50%'> \
						<div class='11u 12u$(xsmall)'> \
							<textarea readonly name='about' id='aboutUser' placeholder='Your Status comes here' style='background:transparent;' rows='2'></textarea> \
						</div> \
						<div class='1u$ 12u$(xsmall)'> \
							<a data-toggle='modal' data-target='#editStatus' class='icon fa fa-pencil-square-o'></a> \
						</div> \
					</div> \
				</form> \
			</section>");
	$(".upload-group").show();
	$('#welcomeNote').hide();
	$('#stats').show(2500);
	$('#photos_section').show(2500);
	$('#two').html(" <ul class='actions'> \
	<li> <a data-toggle='modal' data-target='#uploadImage' class='button special icon fa fa-plus'>Add New</a></li > \
	</ul>");
	$('#logout').show(2500);
	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			// User is signed in.
			var token = firebase.auth().currentUser.uid;
			queryDatabase(token);
			console.log("Checking Cookie");
			checkCookie();
		} else {
			// No user is signed in.
			// window.location = "index.html";
		}
	});
}
//Edit the status

function updateStatus(){
	var status = document.getElementById('status').value;
	document.getElementsByName("about")[0].value = "";
	document.getElementsByName("about")[0].placeholder = status;

	//Update Status to Firebase
	firebase.database().ref('Users/' + user.uid).set({

		Status: status
	});
	// $('#editStatus').modal('hide');
	console.log(status);
}

//UPLOAD IMAGE to FIREBASE
var selectedFile;

$("#file").on("change", function (event) {
	selectedFile = event.target.files[0];
	$("#uploadButton").show();
});

function uploadFile(){
	// Create a root reference
	var filename = selectedFile.name;
	var storageRef = firebase.storage().ref('/allImages/' + filename);
	var uploadTask = storageRef.put(selectedFile);

	// Register three observers:
	// 1. 'state_changed' observer, called any time the state changes
	// 2. Error observer, called on failure
	// 3. Completion observer, called on successful completion
	uploadTask.on('state_changed', function (snapshot) {
		// Observe state change events such as progress, pause, and resume
		// See below for more detail
	}, function (error) {
		// Handle unsuccessful uploads
	}, function () {
		// Handle successful uploads on complete
		// For instance, get the download URL: https://firebasestorage.googleapis.com/...

		
		// var postKey = firebase.database().ref('Posts/').push().key;
		// var downloadURL = uploadTask.snapshot.downloadURL;
		// var updates = {};
		// var postData = {
		// 	url: downloadURL,
		// 	caption: $("#imageCaption").val(),
		// 	user: user.uid
		// };
		// updates['/Posts/' + postKey] = postData;
		// firebase.database().ref().update(updates);

		var postKey = firebase.database().ref('Posts/').push().key;
		var downloadURL = uploadTask.snapshot.downloadURL;
		var updates = {};
		var postData = {
			url: downloadURL,
			caption: $("#imageCaption").val(),
			postid: postKey,
			userid: user.uid

		};
		updates['/Posts/' + postKey] = postData;
		firebase.database().ref().update(updates);
	});


	console.log("Image Uploaded");
	// window.reload();
}
var numberofimages = 0;
function queryDatabase(token) {
	var currentRow;

	var post_ref = firebase.database().ref('Posts');
	post_ref.orderByKey().on("child_added", function (snapshot) {
		if(snapshot.val().userid == user.uid){
			
			console.log("User :" + user.uid + "Image:" + snapshot.val().caption);
			if (numberofimages % 3 == 0) {
				currentRow = document.createElement("div");
				$(currentRow).addClass("row");
				$("#contentHolder").append(currentRow);
			}
			var col = document.createElement("div");
			$(col).addClass("col-lg-4");
			var image = document.createElement("img");
			image.src = snapshot.val().url;
			$(image).addClass("contentImage");
			// var p = document.createElement("p");
			var br = document.createElement("br");
			var btn = document.createElement("'<button/>', { \
				text: 'View', \
				id: 'btn_' "+ user.uid+", \
				click: function () { alert(id); } \
			});");
			$(btn).addClass("button small");
			$(btn).html("View");
			// $(p).html(snapshot.val().caption);
			// $(p).addClass("contentCaption");
			$(col).append(image);

			// $(col).append(p);
			$(col).append(btn);
			// $(btn).id("id_"+);
			$(col).append(br);
			$(currentRow).append(col);
			numberofimages++;
		}	
	});

}

// CHECK Cookie
function checkCookie() {
	console.log("Checking Cookie..");
	var user_name = getCookie("username");
	if (user_name != "") {
		alert("Welcome again " + user_name);
	} else {
		user_name = user.displayName;
			setCookie("username", user_name, 30);
			console.log("Cookie Set");

	}
}

// SET COOKIE
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// GET COOKIE
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}


//SIGNOUT FUNCTION
function signOut() {
	firebase.auth().signOut().then(function () {
		console.log('Signed Out');
		location.reload(true); //reload the page from  the server and not the cache
	}, function (error) {
		console.error('Sign Out Error', error);
	});
};