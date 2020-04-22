class Player{
	constructor(tetris,name,uid,avatar){
		this.pos = {x:5,y:4};
		this.maxtrix=  null;
		this.score=0;
		this.arena = tetris.arena;
		this.uid = uid
		this.avatar = avatar
		this.name = name;
		this.dropCounter = 0;
	    this.dropInterval =1000;
	    this.events = new Event;
	    this.reset();
	    this.tetris = tetris;
	}
	 move(dir){
		this.pos.x += dir;
		if (this.arena.collide(this)) {
			console.log("Chạm");
			this.pos.x -= dir;
		}
		this.events.emit('pos', this.pos);
	}
	rotate(dir){
		const pos = this.pos.x;
        let offset = 1;
        this._rotateMaxtrix(this.maxtrix, dir);
        while (this.arena.collide(this)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.maxtrix[0].length) {
                this._rotateMaxtrix(this.maxtrix, -dir);
                this.pos.x = pos;
                return;
            }
        }
 
		this.events.emit('maxtrix',this.maxtrix);
	}
	_rotateMaxtrix(maxtrix, dir){
		 for (let y = 0; y < maxtrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    maxtrix[x][y],
                    maxtrix[y][x],
                ] = [
                    maxtrix[y][x],
                    maxtrix[x][y],
                ];
            }
        }
        if (dir > 0) {
            maxtrix.forEach(row => row.reverse());
        } else {
            maxtrix.reverse();
        }
        console.table(maxtrix);
       // this.maxtrix = maxtrix;
		// return maxtrix;
	}
	drop(){
		this.pos.y ++;
		this.dropCounter =0;
		if(this.arena.collide(this)){
			this.pos.y--;
			this.arena.merge(this);
			this.reset();
			this.score+=this.arena.checkPoint();
			this.events.emit('score', this.score);
		}
		this.events.emit('pos', this.pos);
		
	} 
	update(deltaTime){
		this.dropCounter+= deltaTime;
		if (this.dropCounter>this.dropInterval) {
			this.drop();
		}
	}

	createPieces(type){
		switch(type){
			case 'T': 
				return [[0,0,0],
						[1,1,1],
						[0,1,0]];
			case 'O': 
				return [[2,2],
						[2,2]];
			case 'L':
				return [[0,3,0],
						[0,3,0],
						[3,3,0]];
			case 'I':
				return [[0,4,0,0],
						[0,4,0,0],
						[0,4,0,0],
						[0,4,0,0]];
			case 'S': 
				return [[0,5,5],
						[5,5,0],
						[0,0,0]];
			case 'Z': 
				return [[6,6,0],
						[0,6,6],
						[0,0,0]];
			case 'J': 
				return [[0,0,7],
						[0,0,7],
						[0,7,7]];
		}
	}
	
	reset(){
		const pieces = 'ILZOTSJ';
		const rand = Math.floor(Math.random() * 7);
		this.maxtrix = this.createPieces(pieces[rand]);
		this.pos.y = 0;
		this.pos.x = (this.arena.maxtrix[0].length/2|0) - (this.maxtrix[0].length/2|0); 
		console.log(this.pos.x); 
		if(this.arena.collide(this)){
			this.arena.clear();
			this.events.emit('game-over', this.score);
			alert("GAME OVER!");
			this.score = 0;
			this.events.emit('score', this.score);
			//this.updateScore(this.score);
			// this.arena.maxtrix.forEach((row)=> row.fill(0));
		}
		this.events.emit('pos',this.pos);
		this.events.emit('maxtrix',this.maxtrix);
	}

}