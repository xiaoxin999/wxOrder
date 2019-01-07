/* 
    图片裁剪
 */

 <template>
    <section id="img_clip">

        <div ref = "con" class='img_container'>

        </div>
        
        <div class='inter'>
            <div class="btn" @click="cancle">取消</div>
            <div  class="btn" @click="complete">完成</div>
        </div>
        
        
    </section>
 </template>
 
 <script>
    import ImgCompress from "src/verdor/img_compress";
    import cropper from "src/verdor/cropper";
    import EXIF from "src/verdor/exif";

    let cro = null;
    export default{
        data(){
            return{
                type:"",
                img:null,
                rectData:{},
                orientation:""
            }
        },
        props:{
            fileStr:null,
            httpUrl:"",
        },
        methods:{
            cancle(){
                this.$emit("sub",{status:"cancle"});
            },
            async complete(){
                setTimeout(async ()=>{
                    
                    let croppedCanvas = null;

                    croppedCanvas = cro.getCroppedCanvas();
                    // croppedCanvas = this.copyCanvas(croppedCanvas);

                    let imgData = croppedCanvas.toDataURL(this.type,0.5);
                    let image = await this.loadImg(imgData);

                    let blob = null;
                    
                    if( imgData.length > (100 * 1024) ){
                        croppedCanvas = this.compress(image);
                    }

                    blob = await this.toBlob(croppedCanvas);

                    this.$emit("sub",{status:"complete",blob});
                },20)
            },

            loadImg(imgData){
                return new Promise((res,rej)=>{
                    let image = document.createElement("img");
                    image.src = imgData;
                    image.onload =  () => {
                        res(image);
                    }
                })
            },
            compress( img) {
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext('2d');
                //瓦片canvas
                let tCanvas = document.createElement("canvas");
                let tctx = tCanvas.getContext("2d");
                let initSize = img.src.length;
                let width = img.width;
                let height = img.height;

                //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
                let ratio;
                if ((ratio = width * height / 4000000) > 1) {
                    ratio = Math.sqrt(ratio);
                    width /= ratio;
                    height /= ratio;
                } else {
                    ratio = 1;
                }
                canvas.width = width;
                canvas.height = height;
                //        铺底色
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                //如果图片像素大于100万则使用瓦片绘制
                let count;
                if ((count = width * height / 1000000) > 1) {
                    count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
                    //            计算每块瓦片的宽和高
                    let nw = ~~(width / count);
                    let nh = ~~(height / count);
                    tCanvas.width = nw;
                    tCanvas.height = nh;
                    for (let i = 0; i < count; i++) {
                    for (let j = 0; j < count; j++) {
                        tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                        ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
                    }
                    }
                } else {
                    ctx.drawImage(img, 0, 0, width, height);
                }
                return canvas;
            },

            //将canvas重回
            copyCanvas(can){

                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');
                let width = can.width;
                let height = can.height;

                canvas.width = width;
                canvas.height = height;
                context.imageSmoothingEnabled = true;
                context.drawImage(can, 0, 0, width, height);
                context.globalCompositeOperation = 'destination-in';
                context.beginPath();
                context.rect(0 , 0 , width , height );
                context.fill();

                return canvas;
    
            },
            toBlob(canvas){
                return new Promise((res,rej)=>{
                    canvas.toBlob(function(data){
                        res(data);
                    },this.type, 0.5);
                })		
            },
    
            setHack(){
                var CanvasPrototype =window.HTMLCanvasElement && window.HTMLCanvasElement.prototype
                var hasBlobConstructor =window.Blob &&
                (function () {
                    try {
                    return Boolean(new Blob())
                    } catch (e) {
                    return false
                    }
                })()
                var hasArrayBufferViewSupport =
                hasBlobConstructor &&
                window.Uint8Array &&
                (function () {
                    try {
                    return new Blob([new Uint8Array(100)]).size === 100
                    } catch (e) {
                    return false
                    }
                })()
                var BlobBuilder =
                window.BlobBuilder ||
                window.WebKitBlobBuilder ||
                window.MozBlobBuilder ||
                window.MSBlobBuilder
                var dataURIPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/
                var dataURLtoBlob =
                (hasBlobConstructor || BlobBuilder) &&
                window.atob &&
                window.ArrayBuffer &&
                window.Uint8Array &&
                function (dataURI) {
                    var matches,
                    mediaType,
                    isBase64,
                    dataString,
                    byteString,
                    arrayBuffer,
                    intArray,
                    i,
                    bb
                    // Parse the dataURI components as per RFC 2397
                    matches = dataURI.match(dataURIPattern)
                    if (!matches) {
                    throw new Error('invalid data URI')
                    }
                    // Default to text/plain;charset=US-ASCII
                    mediaType = matches[2]
                    ? matches[1]
                    : 'text/plain' + (matches[3] || ';charset=US-ASCII')
                    isBase64 = !!matches[4]
                    dataString = dataURI.slice(matches[0].length)
                    if (isBase64) {
                    // Convert base64 to raw binary data held in a string:
                    byteString = atob(dataString)
                    } else {
                    // Convert base64/URLEncoded data component to raw binary:
                    byteString = decodeURIComponent(dataString)
                    }
                    // Write the bytes of the string to an ArrayBuffer:
                    arrayBuffer = new ArrayBuffer(byteString.length)
                    intArray = new Uint8Array(arrayBuffer)
                    for (i = 0; i < byteString.length; i += 1) {
                    intArray[i] = byteString.charCodeAt(i)
                    }
                    // Write the ArrayBuffer (or ArrayBufferView) to a blob:
                    if (hasBlobConstructor) {
                    return new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], {
                        type: mediaType
                    })
                    }
                    bb = new BlobBuilder()
                    bb.append(arrayBuffer)
                    return bb.getBlob(mediaType)
                }
                if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
                    if (CanvasPrototype.mozGetAsFile) {
                        CanvasPrototype.toBlob = function (callback, type, quality) {
                        var self = this
                        setTimeout(function () {
                            if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
                            callback(dataURLtoBlob(self.toDataURL(type, quality)))
                            } else {
                            callback(self.mozGetAsFile('blob', type))
                            }
                        })
                        }
                    } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
                        CanvasPrototype.toBlob = function (callback, type, quality) {
                            var self = this
                            setTimeout(function () {
                                callback(dataURLtoBlob(self.toDataURL(type, quality)))
                            })
                        }
                    }
                }
            },
            getExif(img){
                return new Promise((res,rej)=>{
                    EXIF.getData(img, function(){
                        EXIF.getAllTags(this);
                        res(EXIF.getTag(this, 'Orientation'));
                    });
                })
                
            },
            //对图片旋转处理 added by lzk  
            rotateImg(img, direction,canvas) {    
                //alert(img);  
                //最小与最大旋转方向，图片旋转4次后回到原方向    
                var min_step = 0;    
                var max_step = 3;    
                //var img = document.getElementById(pid);    
                if (img == null)return;    
                //img的高度和宽度不能在img元素隐藏后获取，否则会出错    
                var height = img.height/2;    
                var width = img.width/2;    
                //var step = img.getAttribute('step');    
                var step = 2;    
                if (step == null) {    
                    step = min_step;    
                }    
                if (direction == 'right') {    
                    step++;    
                    //旋转到原位置，即超过最大值    
                    step > max_step && (step = min_step);    
                } else {    
                    step--;    
                    step < min_step && (step = max_step);    
                }    
                //img.setAttribute('step', step);    
                /*var canvas = document.getElementById('pic_' + pid);   
                if (canvas == null) {   
                    img.style.display = 'none';   
                    canvas = document.createElement('canvas');   
                    canvas.setAttribute('id', 'pic_' + pid);   
                    img.parentNode.appendChild(canvas);   
                }  */  
                //旋转角度以弧度值为参数    
                var degree = step * 90 * Math.PI / 180;    
                var ctx = canvas.getContext('2d');    
                switch (step) {    
                    case 0:    
                        canvas.width = width;    
                        canvas.height = height;    
                        ctx.drawImage(img, 0, 0,img.width,img.height,0,0,width,height);    
                        break;    
                    case 1:    
                        canvas.width = height;    
                        canvas.height = width;    
                        ctx.rotate(degree);    
                        ctx.drawImage(img, 0,0,img.width,img.height,0, -height,width,height);    
                        break;    
                    case 2:    
                        canvas.width = width;    
                        canvas.height = height;    
                        ctx.rotate(degree);    
                        ctx.drawImage(img,  0,0,img.width,img.height,-width, -height,width,height);    
                        break;    
                    case 3:    
                        canvas.width = height;    
                        canvas.height = width;    
                        ctx.rotate(degree);    
                        ctx.drawImage(img, 0,0,img.width,img.height,-width, 0,width,height);    
                        break;    
                }    
            }    

        },
        async mounted(){
            
            let ele = document.getElementById(this.fileStr).files[0];
            let re = await ImgCompress.readFile(ele);
            
            let img = await ImgCompress.loadImg(re);
            this.orientation = await this.getExif(img);

            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            let width = canvas.width = img.width;
            let height = canvas.height = img.height;
            
            if (navigator.userAgent.match(/iphone/i)) {  
                //如果方向角不为1，都需要进行旋转 added by lzk  
 
                if(this.orientation != undefined && this.orientation != 1){  

                    switch(this.orientation){  
                        case 6://需要顺时针（向左）90度旋转   
                            this.rotateImg(img,'left',canvas);  
                            break;  
                        case 8://需要逆时针（向右）90度旋转   
                            this.rotateImg(img,'right',canvas);  
                            break;  
                        case 3://需要180度旋转  
                            this.rotateImg(img,'right',canvas);//转两次  
                            this.rotateImg(img,'right',canvas);  
                            break;  
                    }         
                }else{
                    canvas.width = width/2;    
                    canvas.height = height/2;    
                    context.drawImage(img, 0, 0,img.width,img.height,0,0,width/2,height/2);
                }
                
            }else{
                
                context.drawImage(img,0,0,img.width,img.height,0,0,width,height);
            }


            

            let str = canvas.toDataURL(ele.type,0.5);
            img = await ImgCompress.loadImg(str);
            

            img.style.opacity = "0";
            this.$refs.con.appendChild(img);
            this.img = img;
            
            this.type = ele.type;

            this.setHack();
            let scale = (img.width/window.innerWidth).toFixed(2);

            cro = new cropper(img, {
                dragMode:"move",
                aspectRatio:1,
                cropBoxMovable:false,
                cropBoxResizable:false,
                ready:function(){
                    cro.scale(scale>2?1.5:1);
                }
            });

        }
    }
 </script>

 <style lang='less' scoped>

 @import '../res/css/cropper.css';
 
    #img_clip{
        position: fixed;
        top:0;
        top:0;
        width:100%;
        height:100%;
        background: rgb(58,59,62);
        .img_container{
            width:100%;
            height:60%;
            margin-top: 2rem;
        }
        .inter{
            width: 80%;
            margin: 0 auto;
            margin-top: 1rem;
            .btn{
                display: inline-block;
                padding: 0.2rem;
                text-align: center;
                width:2.5rem;
                background-color: rgb(234,192,72);
                border-radius: 0.5rem;
                color:white;
                margin-left: 1rem;
                
            }
        }

    }
 </style>
 