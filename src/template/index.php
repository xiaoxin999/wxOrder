<?php
use Controller\Home\Ini;
$jsExt = \Model\Helper\Tools::getJsExt();
$iniModel = new Ini();
$iniModel->has('<%= htmlWebpackPlugin.options.name %>');
$data = $iniModel->getConfig();

?>
    <!DOCTYPE html>
    <html lang=zh>

    <head>
        <meta charset=utf-8>
        <meta name=viewport
              content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">
        <meta name=apple-mobile-web-app-capable content=yes>
        <meta name=apple-mobile-web-app-status-bar-style content=black-translucent>
        <meta name=screen-orientation content=portrait>
        <meta name=x5-orientation content=portrait>
        <title><%= htmlWebpackPlugin.options.title %></title>
        <script>
            var httpDomain = {
                host:<?php echo '"' . $data['host'] . '"'?>,
                api:<?php echo '"' . $data['api'] . '"'?>,
                cdn:<?php echo '"' . $data['cdn'] . '"'?>,
                cdnVer:<?php echo '"' . $data['cdnVer'] . '"'?>,
                upload:<?php echo '"' . $data['upload'] . '"'?>
            }
 
            function loadCssDoc(obj){
                var xhr=new XMLHttpRequest();
                xhr.onreadystatechange=function(){
                    if (xhr.readyState==4 && xhr.status==200){

                        var str = xhr.responseText;
                        var reg = new RegExp(obj.replaceStr,"g");
                        str = str.replace(reg,"<?php echo $cdn ?>");

                        var style =document.createElement("style");
                        style.setAttribute("type","text/css");
                        style.innerText = str;
                        document.head.appendChild(style);
                    }
                }
                xhr.open("GET",obj.str,true);
                xhr.send();
            }
            
        </script>
    </head>

    <body>
        <div id=app>
            <router-view></router-view>
        </div>
        
    </body>
    </html>
<?php
$iniModel->set('<%= htmlWebpackPlugin.options.name %>');
?>