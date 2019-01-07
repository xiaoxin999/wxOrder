<template>
    <div id="add-address">
        <div class="add-ress">
            <input type="text" id="keyword" name="keyword" @input = 'tempFn'  placeholder="请输入关键字搜索"/>
        </div>
		<div class="divInfo">
			<p>当前地址</p>
			<div><span class="text-over" @click="getNowValue()">{{loadName}}</span><a href="javascript:void(0);" @click="reload">重新定位</a></div>
		</div>
		<div class="divInfo">
			<p>{{!statusType?"附近地点推荐":"当前搜索"}}</p>
			<ul class="select_ul">
				<li v-for="(item,index) in tips" :key="index"  @click="getValue(item,index)">{{item.name}} <span v-if='item.district'>{{item.district}}</span></li>
			</ul>
		</div>	
    </div>
</template>

<script>

    import http from 'src/manager/http';
	import global from 'src/manager/global';
    import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';

	let map = null;
    export default {
        name: '',
        data(){
            return {
				city:"",
				search:null,
				tips:[],
				type:0,
				cityName:"",
				loadName:"定位中...",
				statusType:false,
				tempFn:()=>{},
				district:"",
				index:this.$route.query.index,
				getCityName:"",
				cityData:{},
				getNowAddress:''
            }
        },
        methods: {
			getGaodeMap(e){
				this.statusType = true;
				this.search.search(e.target.value, (status, result)=>{
						this.tips = result.tips;
				});
			},
			
			getValue(item,index){
				this.cityName = item.name; 
				this.district = item.district;
				let re =/(?:.*省)?(.*?市)/g;
				if(re.test(this.district)){
					this.district = RegExp.$1
				}
				storage.session("addressForsearch",item);
				storage.session("addAddress");
				let kk = this.$route.query.index;
				this.reload();
				this.$router.push({path:"/addAddress",query:{cityName:this.district || this.getCityName,index:kk,loadName:this.loadName}})
			},
			reload(){
				map.loadLocation().then((data)=>{
					this.cityData = data;
					console.log(this.cityData);
					this.loadName = data.formattedAddress;
					this.getCityName = data.formattedAddress;
					let re =/(?:.*省)?(.*?市)/g;
						if(re.test(this.getCityName)){
							this.getCityName = RegExp.$1;
						}
						this.cityName =  RegExp.$1;
					if(this.statusType) return;
					this.tips = data.pois.slice(0,5).map((item)=>{
						delete item.district;
						return item;
					});

					storage.session("getCityData",this.cityData);
				},()=>{

				})

				
			},
			getNowValue(){
				
				this.cityData = storage.session("getCityData");
				this.getNowAddress = this.cityData.formattedAddress;
				let re =/(?:.*省)?(.*?市)/g;
						if(re.test(this.getNowAddress)){
							this.getNowAddress = RegExp.$1;
						}
				let kk = this.$route.query.index;
				
				this.$router.replace({path:"/addAddress",query:{cityName:this.getNowAddress,index:kk}})
				storage.session("addressForsearch",null);
				
			},
			mapAuto(){
				AMap.plugin(['AMap.Autocomplete'],()=>{
						var autoOptions = {
							city: this.city.adcode //城市，默认全国
						};
						this.search = new AMap.Autocomplete(autoOptions);
					});
			}
        },
        async mounted(){
			map = await import(/* webpackChunkName:"map" */"src/manager/map");
			map = map.default;
			await map.getMapSDK();
			this.tempFn = utils.throttle(this.getGaodeMap,300,500,this)
			this.mapAuto();
			this.reload();
			this.city = await map.getCity();
            utils.setTitle("请选择收货地址");
		},
    }
</script>

<style lang="less" scoped>
#add-address{
	width: 100%;
	height: 100%;
	font-size: 0.37333rem;
	.add-ress{
		    width: 100%;
			height: 1.2rem;
			background: #000;
			line-height: 1.2rem;
			display: flex;
			align-items: center;
			input#keyword{
				    width: 94%;
					height: 0.89rem;
					text-indent: 0.26667rem;
					box-sizing: border-box;
					border: none;
					margin: 0 auto;
					text-align: center;
					}
				}
		.divInfo{
			p{
				    width: 94%;
					margin: 0 auto;
					font-size: 0.32rem;
					color: #888;
					height: 0.8rem;
					line-height: 0.8rem;
			}
			div{
				    height: 1.2rem;
					background: #fff;
					line-height: 1.2rem;
					span{
						        display: inline-block;
								width: 77%;
								margin-left: 3%;
											}
											a{
						        display: inline-block;
								width: 20%;
								color: #efa84d;
								    float: right;
					}
			}
			ul{
					width: 100%;
					padding: 0 3%;
					background: #fff;

					li{
						border-bottom: 1px solid #eaeaea;
						padding: 0.24rem 0;
						
					span{
						        font-size: 0.3rem;
								color: #999;
								display: block;
								padding: 0.1rem 0;
					}
					}
			}

		}
		div:nth-child(3){
			height: calc(~"100% - 3.2rem");
			ul{
				height: calc(~"100% - 0.8rem");
				overflow-y: auto;
			}
		}
	

}
</style>

