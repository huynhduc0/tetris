class Tetris{
	constructor(element){
		this.element = element;
		this.canvas = element.querySelector(".tetris");;
		this.context = this.canvas.getContext('2d');
		this.context.scale(20,20);
		this.arena = new Arena(12,20);
	    this.player = new Player(this);
	    this.player.events.listen('score',score=>{
			this.updateScore(score);
		});
		
		this.color =[null,'purple','#F00','#0F0','#00F','#5ac4bd','#6fe3bc','#12e636','#e36fd2'];
		let lastTime = 0;
		this._update = (time = 0) => {
			const deltaTime = time - lastTime;
			lastTime = time;
			this.player.update(deltaTime);
			this.draw();
			requestAnimationFrame(this._update);
		};
		// this._update();
	}
	draw(){
		this.context.fillStyle = "#000";
		this.context.fillRect(0,0, this.canvas.width, this.canvas.height);
		this.drawMaxtrix(this.arena.maxtrix, {x:0,y:0});
		this.drawMaxtrix(this.player.maxtrix, this.player.pos);
	}
	drawMaxtrix(maxtrix,offset) {
		maxtrix.forEach((row,y)=>{
			row.forEach((value,x)=>{
				if(value!==0){
					this.context.fillStyle = this.color[value];
					this.context.fillRect(x+offset.x,y+offset.y,1,1);
				}
			});
		});
	}
	serialize(){
		return {
			arena: {maxtrix: this.arena.maxtrix},
			player: {
				maxtrix:this.player.maxtrix,
				pos: this.player.pos,
				score: this.player.score
			}
		};
	}
	unserialize(state){
		this.arena = Object.assign(state.arena);
		this.player = Object.assign(state.player);
		this.updateScore(state.player.score);
		this.draw();
	}
	updateScore(score){
		this.element.querySelector(".score").innerText = "SCORE: "+score;
	}
	run(){
		this._update();
	}
}