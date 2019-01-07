<template>
	<div id="add-bill">
		<div class="firm-name">
			<p>企业名称或个人</p>
			<input type="text" placeholder="请输入名称（必填）" v-model="invoiceHeader" maxlength="40" />
		</div>
		<div class="ratepayer">
			<p>纳税人识别号</p>
			<input type="text" placeholder="请输入识别号（必填）" v-model="itin" />
		</div>
		<button v-on:click="setBill">新增</button>
	</div>
</template>

<script>
	import http from 'src/manager/http';
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';


	export default {
		data() {
			return {
				invoiceHeader: '', //发票名称
				itin: '', //纳税人税号
				id: '', //发票id
				shopId: storage.session('select-shop').id,
			};
		},
		methods: {
			async setBill() {
				if (!utils.checkData(
					{
						invoiceHeader: '请输入企业名称或个人',
						itin: {
							reg: /^[A-Z0-9]{15}$|^[A-Z0-9]{17}$|^[A-Z0-9]{18}$|^[A-Z0-9]{20}$/,
							pro: '请输入正确的税号'
						}
					}, this)) {
					return false;
				}
				let res = await http.addInvoice({
					data: {
						id: this.id,
						invoiceHeader: this.invoiceHeader, //发票名称
						itin: this.itin, //纳税人税号
						status: 0, //0:默认 1:默认选
						shopId: this.shopId
					}
				});
				storage.session('billDetail', res);

				this.$router.push('/pay'); // 跳转本地链接

			},

			getDetail(item) {
				this.invoiceHeader = item.invoiceHeader;
				this.itin = item.itin;
				this.id = item.id;
			}
		},
		mounted() {
			let billDetail = storage.session('lists');
			if (billDetail) { // 表示修改
				this.getDetail(billDetail);
			}

			utils.setTitle('发票信息');
		},
		destroyed() {
			//销毁时删除发票信息
			sessionStorage.removeItem('lists');
		}
	};
</script>

<style lang="less" scoped>
	#add-bill {
		width: 100%;
		height: 100%;
		color: #333;

		.firm-name {
			width: 100%;
			height: 1.82667rem;
			display: -webkit-box;
			display: -ms-flexbox;
			display: -webkit-flex;
			display: flex;
			-webkit-box-align: center;
			-ms-flex-align: center;
			align-items: center;
			-webkit-align-items: center;
			-webkit-justify-content: space-between;
			-webkit-box-pack: justify;
			-ms-flex-pack: justify;
			justify-content: space-between;
			background: #fff;
			padding: 0 0.50667rem;
			box-sizing: border-box;
			margin-bottom: 0.16rem;
		}

		.ratepayer {
			width: 100%;
			height: 1.82667rem;
			display: -webkit-box;
			display: -ms-flexbox;
			display: -webkit-flex;
			display: flex;
			-webkit-box-align: center;
			-ms-flex-align: center;
			align-items: center;
			-webkit-align-items: center;
			-webkit-justify-content: space-between;
			-webkit-box-pack: justify;
			-ms-flex-pack: justify;
			justify-content: space-between;
			background: #fff;
			padding: 0 0.50667rem;
			box-sizing: border-box
		}

		p {
			font-size: 0.34667rem;
			color: #333
		}

		input {
			border: none;
			width: 6.08rem;
			height: 1.06667rem;
			background: #F1F1F1;
			text-indent: 0.26667rem;
			line-height: 1.06667rem
		}

		input::-webkit-input-placeholder {
			color: #999;
			font-size: 0.37333rem
		}

		button {
			border: none;
			display: block;
			width: 8.58667rem;
			height: 1.26667rem;
			background: #EAA944;
			color: #fff;
			font-size: 0.48rem;
			border-radius: 0.10667rem;
			margin: 0.53333rem auto
		}
	}
</style>