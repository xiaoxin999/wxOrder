<template>
	<span class="check-span" :class="{on:onoff,off:(!onoff)}" v-on:click="clickHandle">
	</span>
</template>
<script type="text/javascript">
	export default{
		data(){
			return{
				onoff: true
			}
		},
		props:["status"],
		methods:{
			clickHandle:function(){
				this.onoff = !this.onoff;
				this.$emit('status',this.onoff);
			}
		},
		mounted:function(){
			if(!this.status){
				this.onoff = this.status;
			}			
		}
	}
</script>

<style lang='less'>
.check-span {
  display: block;
  width: 88px;
  height: 40px;
  cursor: pointer;
  background: url("../res/images/off.png") no-repeat;
  transition: background-position 0.25s ease-in;
  overflow: hidden; 
}
.check-span.on {
    background-position: -48px 0; 
}
.check-span.off {
    background-position: 0 0; 
}
</style>