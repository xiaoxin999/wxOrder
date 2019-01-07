<template>
    <div id="test-error">
        <header class="header">
            <div>
                <p>闪店微信错误监控系统</p>
            </div>
        </header>
        <section class="content">
             <div>
                 <ul>
                     <li v-for="item in list" :key="'_0' + item">
                         <span>{{item.dates[0]}}</span>
                         <span>{{item.dates[1]}}</span>
                         <span>{{item.dates[2]}}</span>
                         <span>{{item.dates[3]}}</span>
                         <span>{{item.dates[4]}}</span>
                         <span>{{item.dates[5]}}</span>
                     </li>
                 </ul>
             </div>
        </section>
        <footer>

        </footer>
    </div>
</template>

<script>
    export default {
        data(){
            return {
                list: [
                    {'dates':[1,2,3,4,5,65]},
                    {'dates':[1,2,3,4,5,65]},
                    {'dates':[1,2,3,4,5,65]},
                    {'dates':[1,2,3,4,5,65]},
                    {'dates':[1,2,3,4,6,65]},
                    {'dates':[1,2,3,4,5,65]},
                    {'dates':[1,2,3,4,'d',65]},
                    {'dates':[1,2,3,4,5,65]},
                    {'dates':[1,2,3,4,5,65]},
                    {'dates':[1,2,3,4,5,65]},
                    {'dates':[1,2,3,4,5,65]}
                ]
            }
        },
        methods: {

        }
    }
</script>
<style lang="less" scoped>
   #test-error{
       .header{
           width: 100%;
           height: 2rem;
           line-height: 2rem;
           p{
               color: #000;
               font-size: .5rem;
               text-align: center;
           }
       }
       .content{
           width: 100%;
           height: 100%;
       }
   }
</style>
