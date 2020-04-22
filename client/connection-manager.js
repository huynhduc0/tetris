class ConnectionManager{
	constructor(tetrisManager){
		this.conn = null;
		this.peers = new Map;
		this.tetrisManager = tetrisManager;
		this.localTetris = [...tetrisManager.instances][0];
	}
	connect(add){
		this.conn = new WebSocket(add);
		this.conn.addEventListener('open', ()=>{
			console.log("Connection done");
			this.initSession();
			this.watchEvent();
		});
		this.conn.addEventListener('message', event=>{
			console.log('Recived a message: ', event.data);
			this.recieve(event.data);
		});
	}
	initSession(){
		const sessionId = window.location.hash.split('#')[1];
		const state = this.localTetris.serialize();
		if(sessionId){
			this.send({
				type:"join-session",
				id:sessionId,
				state: state
			});
		}else {
			let data = {
				type:"create-session",
				state:state
			};
			this.send(data);
		}
		console.log("lets do this");
		this.send({
			type:"history",
				id:sessionId,
				state: state
			});
	}
	watchEvent(){
		const local = this.localTetris;
		const player = local.player;
		['pos','maxtrix','score'].forEach(prop =>{
			player.events.listen(prop, value=>{
				this.send({
					type:'state-update',
					fragement:'player',
					state:[prop,value]
				});
			});
		});
		const arena = local.arena;
		['maxtrix'].forEach(prop =>{
			arena.events.listen(prop, value=>{
				this.send({
					type:'state-update',
					fragement:'arena',
					state:[prop,value]
				});
			});
		});
		player.events.listen("game-over", value=>{
			this.send({
				type:'game-over',
				score:value,
			});
		});
		//  this.player.events.listen('pos',pos=>{
		// 	console.log("POS CHANGED NOW!", pos);
		// });
		//  this.player.events.listen('maxtrix',maxtrix=>{
		// 	console.log("TE CHANGED NOW!", maxtrix);
		// });
	}
	updateManager(peers){
		const me = peers.you;
		const clients = peers.clients.filter(client => me!== client.id);
		clients.forEach(client =>{
			console.log(client);
			if(!this.peers.has(client.id)){
				const tetris = this.tetrisManager.createPlayer();
				tetris.unserialize(client.state);
				this.peers.set(client.id,tetris);
				console.log(this.peers);
			}
		});
		[... this.peers.entries()].forEach(([id,tetris])=>{
			if(!clients.some(client=> client.id === id)){
				this.tetrisManager.removePlayer(tetris);
				this.peers.delete(id);
			}
		});
		const sorted = peers.clients.map(client=>{
			return this.peers.get(client.id)||this.localTetris
		});
		// console.log(sorted);
		this.tetrisManager.sortPlayer(sorted);
	}
	updatePeers(id,fragement,[prop,value]){
		if(!this.peers.has(id)){
			console.error('Client is not exist',id);
			return;
		}
		const tetris = this.peers.get(id);
		tetris[fragement][prop] = value;
		if(prop === 'score') tetris.updateScore(value);
		else tetris.draw();
	}
	send(data){
		const msg = JSON.stringify(data);
		console.log(`message sending: ${msg}..`);
		this.conn.send(msg);
	}
	recieve(msg){
		const data = JSON.parse(msg);
		if(data.type === "session-created"){
			window.location.hash = data.id;
		}
		else if (data.type === "session-broadcast") {
			// console.log(data);
			this.updateManager(data.peers);
		}
		else if (data.type === "state-update") {
			// console.log(data);
			this.updatePeers(data.clientId,data.fragement, data.state);
		}else if (data.type === "history") {
			let hs = document.getElementById('history');
			console.log(hs)
			let str = "";
			data.history.map((e)=>{
				str+=`<span><img style="width:20px;height:20px"  class="rounded" src = ${e.img}>${e.session} - ${e.username} : ${e.score}</span><br>`;
			});
			hs.innerHTML = str;
				console.log(data)
		}
			
	}
}