class Session{
	constructor(id){
		this.id = id;
		this.clients = new Set;
	}
	join(client){
		if(client.session){
			throw Error('Client has already in session');
		}
		this.clients.add(client);
		client.session = this;
	}
	leave(client){
		if(client.session !== this){
			throw Error('Client has not in session');
		}
		this.clients.delete(client);
		client.session = null;
	}
}
module.exports = Session;