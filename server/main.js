const WebSocketServer =  require("ws").Server
const Session =  require("./session")
const Client = require("./client");

const server = new WebSocketServer({port:6969});
const sessions = new Map;

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