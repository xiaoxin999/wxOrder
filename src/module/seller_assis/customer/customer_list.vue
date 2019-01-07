<template>
	<section class='customerList'>
		<header>
			<!-- <div>
                <span class='left'>共计{{list.length}}人</span>
                <span class='right'>已消费<img src='../../../res/images/sell_assis/consumed.png'/></span>
            </div> -->
			<ul @click='clickMenu'>
				<li>
					<span class='down' ref='s'>
						全部
					</span>
				</li>
				<li>
					<span>
						已消费
					</span>
				</li>
				<li>
					<span>
						临时
					</span>
				</li>
				<li>
					<span>
						标签筛选
						<img style='width:0.32rem;height:0.32rem;filter: invert(100%);' src='../../../res/images/filter.png' />
					</span>
				</li>
			</ul>

		</header>
		<section class='search'>
			<div>
				<div class='search_input'>
					<img src="../../../res/images/sreach.png" alt="">
					<input ref='txt' @input='changeTxt' type="text" placeholder="输入关键字查找客户">
					<div class="clear">
						<img src="../../../res/images/cancel.png" alt="" @click='clear' v-show="text != ''">
					</div>
				</div>
				<span @click='clear'>取消</span>
			</div>
		</section>


		<section style='height:calc(100% - 3.6rem)' class='bottom'>

			<div class="title">
				共计:{{num}}人
			</div>

			<!-- 选中对应的类型或者符合搜索条件时显示  -->
			<div class="content">

				<list @giveData='giveData' :height='height' :size="3.3 * FS" :list="showList" :keyStr="'customerList'" :httpId="'myCustomer'" :httpData="httpData" :callFn="callFn" :callContext="this" :isScroll="true">

					<section ref='list' class='guide_card' slot-scope="prop">
						<div class='content'>
							<img :src="getUrl(prop.data.imageUrl)" alt="">
							<div class='right'>
								<div class='top'>
									<div class="info">
										<div class='n'>
											<span class='name' style='vertical-align: middle;'>{{prop.data.name}}</span>
											<span class='tag' style='vertical-align: middle;' v-if="Number(prop.data.memberId)>0">VIP</span>
											<img src="../../../res/images/sell_assis/consume.png" v-if='prop.data.totalConsumption>0 || prop.data.lastConsumeTime>0' style='vertical-align: middle;' alt="">
											<img class='temp' v-if="prop.data.isTemporary == '1' " src='../../../res/images/sell_assis/temp.png' />
										</div>
										<div class="remark text-over">{{getTxt(prop.data.remark)||"无备注"}}</div>
									</div>

									<div class='callCard' @click='showDetail(prop.data.id)'>
										查看信息
									</div>
									<div style='width:0;clear:both'></div>
								</div>


								<div class='info' style='font-size:0.26rem'>
									<span>券：<em>{{prop.data.couponCount}}</em></span>
									<span>礼：<em>{{prop.data.exchange}}</em></span>
									<span>积分：<em>{{prop.data.point}}</em></span>
								</div>
								<div style='margin-top:0.1rem;font-size:0.26rem;'>
									<span>关注：{{getFormat(prop.data.createTime)}}</span>
									<span style='padding-left:0.2rem' v-if='prop.data.lastConsumeTime>0'>消费：{{getFormat(prop.data.lastConsumeTime)}}</span>
								</div>
							</div>
						</div>
					</section>

				</list>

			</div>

			<section class='none' v-if="!hasList">
				<img src='../../../res/images/sell_assis/no_people.png' />
				<div>没有找到这个客户宝宝哦~</div>
			</section>
		</section>

		<tag v-if="show" :list="tagList" @winEvent="close"></tag>

	</section>
</template>


<script>
	import utils from 'src/verdor/utils';
	import global from 'src/manager/global';
	import storage from 'src/verdor/storage';


	export default {
		data() {
			return {
				list: [],
				num: 0,
				fansId: storage.session('login').fansId, // 获取fansId
				_tempTar: null,
				type: 0,
				text: '',
				hasList: true,
				show: false,
				tagList: [],
				httpData: {
					shopId: global.getShopId(),
					page: 1,
					num: 10,
					fansId: storage.session('login').fansId,
					tagId: '',
					keywords: '',
					ctype: '0'
				},
				fn: null,
				showList: [],
				height: utils.getWindowWH().h - 4.6 * this.FS
			};
		},
		methods: {
			giveData(obj) {
				this.num = obj.num;
			},
			getTxt(str) {
				return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
			},
			close(obj) {
				this.show = false;

				if (obj.type == 'ok') {

					let str = '';
					/* eslint-disable-next-line */
					for (let [key, value] of obj.data) {
						str += value.id + ',';
					}
					this.httpData.tagId = str;
				}
			},
			clear() {
				this.text = this.$refs.txt.value = '';
				this.fn();
			},
			changeTxt(e) {

				this.text = e.target.value;
				this.fn();
			},
			changInfo() {
				this.httpData.keywords = this.text;
			},
			clickMenu(e) {

				let target = e.target;

				if (target.tagName.toLowerCase() == 'ul') {
					return;
				}
				if (!/span/gi.test(target.tagName)) {
					target = target.children[0];
				}

				// if(target === this._tempTar) return;
				target.className = 'down';

				let index = Array.from(e.currentTarget.children).indexOf(target.parentNode);
				this.type = index;

				this._tempTar && (target != this._tempTar) && (this._tempTar.className = '');
				this._tempTar = target;

				if (index < 3) {
					this.httpData.ctype = index;
					this.httpData.tagId = '';
				} else {
					if (this.tagList.length < 1) {
						this.$store.commit('setWin', {
							content: '暂无可筛选的标签'
						});
						return;
					}
					this.show = true;
				}


			},
			callFn(data) {

				if (data.error && data.error.code == 5303) {
					this.$store.commit('setWin', {
						content: '没有权限!',
						callBack: () => {
							this.$closeWindow();
						}
					});
				}
				let l = Object.values(data.tags);
				if (l.length > 0) {
					this.tagList = l;
				}
				return data.customerList;
			},
			showDetail(id) {
				this.$router.push({
					path: '/myConsumer',
					query: {
						'id': id
					}
				});
			},
			getUrl(url) {
				if (url == undefined) return '';
				return global.getImgUrl({
					url
				});
			},
			getFormat(time) {
				return utils.format(time, 'yyyy-MM-dd');
			}
		},
		components: {
			tag: () =>
				import( /* webpackChunkName: 'tag_filter' */ './tag_filter'),
			'list': () =>
				import( /* webpackChunkName:'list' */ 'src/components/list')
		},
		mounted() {
			this._tempTar = this.$refs.s;
			this.fn = utils.throttle(this.changInfo, 500);
			utils.setTitle('客户列表');
		}
	};
</script>

<style lang='less' scoped>
	.customerList {
		height: 100%;

		header {
			height: 2rem;
			background-color: rgb(20, 20, 20);

			ul {
				color: #FFFFFF;
				font-size: .4rem;
				display: flex;
				align-items: center;
				justify-content: center;
				vertical-align: middle;
				width: 100%;
				height: 100%;

				li {

					width: 100%;
					text-align: center;

					span {
						display: inline-block;
						height: 0.7rem;
						vertical-align: middle;
						pointer-events: none;

						img {
							width: 0.44rem;
							height: 0.44rem;
							vertical-align: middle;
						}
					}

					span.down {
						border-bottom: 2px solid #FFFFFF;
					}
				}
			}
		}

		.search {
			height: 1.6rem;
			background-color: #F8F8F8;
			position: relative;
			padding: 0 4%;

			&>div {
				width: 9.28rem;
				margin: auto;
				height: 1.1467rem;
				position: absolute;
				top: 0;
				bottom: 0;

				.search_input {
					width: 7.8933rem;
					height: 1.1467rem;
					background-color: #FFFFFF;
					border: 1px #DCDCDC solid;
					display: inline-block;
					position: relative;
					top: 50%;
					transform: translate(0, -50%);
					padding-left: 1rem;
					vertical-align: middle;

					img {
						width: 0.4rem;
						height: 0.4rem;
						position: absolute;
						margin-left: -0.6rem;
						margin-top: 0.4rem;
					}

					input {
						font-size: 0.32rem;
						width: 100%;
						border: none;
						position: relative;
						top: 50%;
						transform: translate(0, -50%);
						text-indent: 0.3rem;
					}

					.clear {
						float: right;

						img {
							width: 0.4rem;
							height: 0.4rem;
							position: absolute;
							margin-top: 0rem;
						}
					}
				}
			}

			span {
				font-size: 0.3467rem;
				color: #999;
				line-height: 1.1467rem;
				padding-left: 0.5rem;
			}
		}

		.bottom {

			background-color: white;
			padding-bottom: 0.1rem;

			div.title {
				width: 9.28rem;
				margin: 0 auto;
				line-height: 1rem;
				height: 1rem;
				font-size: 0.2667rem;
				color: #303030;
				padding-left: 0.1rem;

				&::before {
					display: inline-block;
					width: 0.1333rem;
					height: 0.4rem;
					line-height: 0.4rem;
					vertical-align: middle;
					background-color: #EAC048;
					content: ""
				}
			}

			div.content {
				overflow: auto;
				height: calc(~"100% - 1rem");

				.guide_card {
					width: 9.28rem;
					height: 3rem;
					margin: 0 auto;
					border-radius: 0.1rem;
					border: #999 solid 1px;
					margin-bottom: 0.3rem;
					display: table;

					.content {
						display: table-cell;
						vertical-align: middle;
						text-align: center;

						img {
							width: 1.7rem;
							height: 1.7rem;
							vertical-align: middle;
						}

						div.right {
							display: inline-block;
							vertical-align: middle;
							width: 75%;
							text-align: left;
							margin-left: 0.2rem;

							div.top {
								margin-bottom: 0.2rem;

								&>div.info {
									width: 4.5rem;
									display: inline-block;

									div.n {
										display: inline-block;
										vertical-align: top;

										span.name {
											font-size: 0.4rem;
											font-weight: bold;
										}

										span.tag {
											display: inline-block;
											width: 0.82rem;
											border: 1px solid #D0021B;
											border-radius: 0.1rem;
											text-align: center;
											color: #D0021B;
											margin-left: 0.1rem;
										}

										img {
											width: 0.36rem;
											height: 0.36rem;
											vertical-align: middle;
										}

										img.temp {
											width: 0.43rem;
											height: 0.3rem;
										}
									}

									.remark {
										width: 4rem;
										text-overflow: ellipsis;
										overflow: hidden;
									}

									.info {
										span {
											padding-left: 0.2rem;
										}

										span:nth-child(1) {
											padding-left: 0;
										}

										em {
											color: rgb(234, 192, 71);
										}
									}

								}

								.callCard {
									width: 2.18rem;
									height: 0.84rem;
									background-color: rgb(234, 192, 71);
									border-radius: 1.33rem;
									line-height: 0.8rem;
									text-align: center;
									color: white;
									float: right;
								}
							}



						}
					}
				}
			}


			.none {
				width: 6rem;
				height: 4rem;
				margin: auto;
				text-align: center;
				margin-top: 2rem;

				img {
					width: 0.88rem;
					height: 0.88rem;
				}

				div {
					font-size: 0.3rem;
					color: #999999;
				}
			}
		}
	}
</style>