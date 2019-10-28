class Client{
	constructor(conn,id){
		this.conn = conn;
		this.session = null;
		this.id = id;
		this.state = null;
	}
	broadcast(data){
		if(!this.session){
			throw new Error("Can't not broadcast without session");
		}
		data.clientId =  this.id;
		this.session.clients.forEach(client=>{
			if(this === client){
				return;
			}else{
				client.send(data);
			}
		});
	}
	send(data){
		const msg = JSON.stringify(data);
		console.log(`Send Message ${msg}`);
		this.conn.send(msg, function ark(err) {
			if (err) {
				console.log("fail to send :(, ",msg,err);
			}
		});
	}
}
module.exports = Client;