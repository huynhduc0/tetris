class ConnectionManager{
	constructor(){
		this.conn = null;
	}
	connect(add){
		console.log(this.conn);
		this.conn = new WebSocket(add);
		this.conn.addEventListener('open', ()=>{
			console.log("Connection done");
			this.conn.send("create-session");
		});
	}
}