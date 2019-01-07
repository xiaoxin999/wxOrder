
let Socket = {

	_socket:null,
	cache:{},
	timer:null,
	init({url,open,message,error,id}){
		this.url = url;
		this.open = open;
		this.message = message;
		this.err = error;
		this.socket = new WebSocket(url);
		Socket._socket = this.socket;
		Socket.id = id;
		this.socket.addEventListener("open",this.open);
		this.socket.addEventListener("message",this.message);
		this.socket.addEventListener("error",this.close);
		this.socket.addEventListener("close",this.close);

		clearInterval(Socket.timer);
		Socket.timer = setInterval(function(){
			Socket.send("ping");
		},15000)

		if(!Socket.cache[id]){
			Socket.cache[id] = {};
			Socket.cache[id].num = 0;
		}

		
	},

	send(obj){
		console.log(Socket._socket.readyState);
		
		if(Socket._socket.readyState  == 1 ){
			Socket._socket.send(obj)
		}else{
			
			Socket.destroyed();
		}
	},

	destroyed(){
		
		Socket.socket.close();
		Socket.socket.removeEventListener("open",Socket.open);
		Socket.socket.removeEventListener("message",Socket.message);
		Socket.socket.removeEventListener("error",Socket.close);
		Socket.socket.removeEventListener("close",Socket.close);
	},

	close(event){
		console.log(event);
		clearInterval(Socket.timer);
		Socket.err&&Socket.err(event);

		let str = "0,2,3";
		let status  = Socket._socket.readyState;
		let id = Socket.id;
		
		if(str.indexOf(status) > -1){
			if(status == 3){
				Socket.destroyed();
			}
			Socket.cache[id].num++;
			if(Socket.cache[id].num < 3){
				
				Socket.init({url:Socket.url,open:Socket.open,message:Socket.message,error:Socket.err,id:id});
			}
			
		}
		
	}
}

export default Socket;