const tetrisManager = new TetrisManager(document);
const localTetris = tetrisManager.createPlayer();
localTetris.element.classList.add('local');
localTetris.run();
const connection = new ConnectionManager(tetrisManager);
connection.connect("ws://localhost:6969");

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
// document.addEventListener('keydown',event =>{
// 	tetrisManager.instances.forEach((e)=>{
// 		const player = localTetris.player;
// 		if(event.keyCode === 37 ){
// 			player.move(-1);
// 		}
// 		else if(event.keyCode === 39){
// 			player.move(1);
// 		}else if(event.keyCode === 40){
// 			player.drop();
// 		}
// 		else if(event.keyCode === 38){
// 			player.rotate(1);
// 		}
// 	});
// });


