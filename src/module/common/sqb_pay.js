
import http from 'src/manager/http';
import storage from 'src/verdor/storage';

/*
	收钱吧通用全局检测方法
 */
function CamelsToLine(str){
	return str.replace(/([A-Z])/g,function(...arg){
		return '_' + arg[0].toLowerCase();
	});
}
export default{
	
	async mounted() {
		if(this.SQB_TYPE){
			let key = CamelsToLine(this.SQB_TYPE) + '_data';
			let oid = storage.session(key);
			if (oid) {
				storage.session(key, null);
				let d = await http.getStatusByOid({
					data: {
						shopId: this.shopId,
						oid: oid,
						type:this.SQB_TYPE
					}
				});
				
				let fn = this.checkSqbSuc;

				if(fn){
					fn();
				}else{
					if (d) {
						this.$store.commit('setWin', {
							content: `支付成功`,
							callBack: () => {
								this.$closeWindow();
							}
						});
					} else {
						this.$store.commit('setWin', {
							content: '支付失败'
						});
					}
				}
				
			}
		}	
	}
};