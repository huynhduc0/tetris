var firebaseConfig = {
	   apiKey: "AIzaSyBrC1cEI0DrFZ8yN7VIUn7LDkXhzI5XX2s",
	  authDomain: "instakilogram-14d79.firebaseapp.com",
	  databaseURL: "https://instakilogram-14d79.firebaseio.com",
	  projectId: "instakilogram-14d79",
	  storageBucket: "instakilogram-14d79.appspot.com",
	  messagingSenderId: "409839865244",
	  appId: "1:409839865244:web:775316685369be1e498c59",
	  measurementId: "G-YW2M3SYNK7"
	    };
firebase.initializeApp(firebaseConfig);
var provider = new firebase.auth.GoogleAuthProvider();
var ip = "94.156.201.1"

var previousUser = firebase.auth().currentUser;
console.log(previousUser)

function googleSignin() {
   firebase.auth()
   
   .signInWithPopup(provider).then(function(result) {
      var token = result.credential.accessToken;
      var user = result.user;
      console.log(token)
      console.log(user.uid)
      letGame(user);
   }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(error)
      console.log(error.message)
   });
}
function letGame(user){
	$("#sign").addClass('d-none')
      const tetrisManager = new TetrisManager(document);
		// var name = window.prompt("tên em meii");
		name = user.displayName
		uid = user.uid
		avatar = user.photoURL
		const localTetris = tetrisManager.createPlayer(name,uid,avatar);
		localTetris.element.classList.add('local');
		localTetris.run();
		const connection = new ConnectionManager(tetrisManager);
		connection.connect(`ws://${ip}:6969`);

		const keyListener = (event) => {
		    [
		        [65, 68, 81, 69, 83],
		    ].forEach((key, index) => {
		        const player = localTetris.player;
		        if (event.type === 'keydown') {
		           if(event.keyCode === 37 ){
						player.move(-1);
					}
					else if(event.keyCode === 39){
						player.move(1);
					}else if(event.keyCode === 40){
						player.drop();
					}
					else if(event.keyCode === 38){
						player.rotate(1);
					}
		        }
		    });
};

document.addEventListener('keydown', keyListener);
document.addEventListener('keyup', keyListener);
}
function facebookLogin(){
	var fbprovider = new firebase.auth.FacebookAuthProvider();
	firebase.auth().signInWithPopup(fbprovider).then(function(result) {
	  // This gives you a Facebook Access Token. You can use it to access the Facebook API.
	  var token = result.credential.accessToken;
	  // The signed-in user info.
	  var user = result.user;
	  console.log(user)
	  letGame(user);
	}).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;
	  // ...
	});
}
function googleSignout() {
   firebase.auth().signOut()
	
   .then(function() {
      console.log('Signout Succesfull')
   }, function(error) {
      console.log('Signout Failed')  
   });
}
