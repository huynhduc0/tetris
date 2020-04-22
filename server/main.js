const WebSocketServer =  require("ws").Server
const Session =  require("./session")
const Client = require("./client");

const server = new WebSocketServer({port:6969});
const sessions = new Map;
var mysql = require('mysql');
 
console.log('Get connection ...');
 
var conn = mysql.createConnection({
  database: 'tetris',
  host: "localhost",
  user: "root",
  password: ""
});
conn.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
function insertScore(sessionid, uid, score,username,img){

	var sql = `insert into score value ("","${sessionid}","${uid}","${score}","${username}","${img}") `;
	console.log(sql)
    conn.query(sql, function(err, results) {
        if (err) throw err;
        console.log("INSERTED SCORE");
    });
}
function getHistoryScore(uid){
	var sql = `select session from score where uid ="${uid}"`;
	console.log(sql)
    conn.query(sql, function(err, results) {
        if (err) throw err;
        let arr = [];
       results.map( (e)=>{
       		arr.push("'"+e.session+"'");
       })
       str = arr.join(",");
       sql = `SELECT * from score where session in (${str})`;
       console.log(sql);
       conn.query(sql, function(err, results) {
       	console.log(results);
       	return results;
       });
    });
}
const historyScore = uid => {
  return new Promise((resolve, reject) => {
    var sql = `select session from score where uid ="${uid}"`;
	console.log(sql)
    conn.query(sql, function(err, results) {
        if (err) throw reject(err);
        let arr = [];
       results.map( (e)=>{
       		arr.push("'"+e.session+"'");
       })
       str = arr.join(",");
       sql = `SELECT * from score where session in (${str})`;
       console.log(sql);
       conn.query(sql, function(err, results) {
       	console.log(results);
       	resolve(results);
       });
    });
  })
}
function createId(len = 6,strings = 'qwertyuiopasdfghjklzxcvbnm1234567890') {
	let id="";
	while(len--)
		id += strings[Math.random()*strings.length-1|0];
	return id;
}
function createClient(conn, id = createId()){
	return new Client(conn, id);
}
function createSession(id = createId()){
	if(sessions.has(id)){
		throw new Error(`SESSION WITH ID ${id} already exist`);
	}else{
		const session = new Session(id);
		console.log("creating session ", id);
		sessions.set(id, session);
		return session;
	}
}

function getSession(id){
	return sessions.get(id);
}
function broadCastSession(session){
	const clients = [...session.clients];
	clients.forEach((client)=>{
		client.send({
			type:"session-broadcast",
			peers:{
				you:client.id,
				clients: clients.map(client=> {
					return {
						id:client.id,
						state:client.state,
					}
				}),
			}
		});
	});
}
server.on("connection", conn =>{
	console.log("Connection On!")
	const client = createClient(conn);
	console.log(sessions);
	conn.on("message", message =>{
		console.log(message);
		const data = JSON.parse(message);
		if(data.type === "create-session"){
			const session = createSession();
			session.join(client);
			client.state = data.state;
			client.send({type:'session-created', id:session.id});
		}else if(data.type === "join-session"){
			const session = getSession(data.id)||createSession(data.id);
			session.join(client);
			client.state = data.state;
			console.log(session);
			broadCastSession(session);
		}
		else if(data.type ==='state-update'){
			const [prop,value] = data.state;
			client.state[data.fragement][prop] = value;
			client.broadcast(data);
		}
		else if(data.type ==='game-over'){
			console.log(client.state.player.uid);
			insertScore(client.session.id,client.state.player.uid,data.score,client.state.player.name,client.state.player.avatar);
			client.broadcast(data);
			const promiseSuccess = historyScore(client.state.player.uid)
			  .then(data =>{
			  	client.broadcast({type:'history', history:data})
			  	client.send({type:'history', history:data})
			  })
			  .catch(err => console.log(nocake))
			//client.send({type:'session-created', id:session.id});
		}
		else if(data.type ==='history'){
			// const va = getHistoryScore(client.state.player.uid);
			// //client.send({type:'session-created', id:session.id});
			// va.then(client.send({type:'history', history:va}),function(){
			// 	console.log("err")
			// })
			// const va = new Promise(getHistoryScore(client.state.player.uid).then(function(){
			// },function(){});
			const promiseSuccess = historyScore(client.state.player.uid)
			  .then(data =>{
			  	client.broadcast({type:'history', history:data})
			  	client.send({type:'history', history:data})
			  })
			  .catch(err => console.log(nocake))
		}
	});
	conn.on("close", ()=>{
		session =client.session;
		if(session){
			 session.leave(client);
			 if(session.clients.size === 0){
			 	sessions.delete(session.id);
			 }
		}
		console.log("Connection Closed! :(");
		broadCastSession(session);
	});
});