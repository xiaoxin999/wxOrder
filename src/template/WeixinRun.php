
<!doctype html>
 <html lang="zh-cmn-Hans" translate="no">
 <head>
     <meta charset="UTF-8" />
     <meta content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" name="viewport">
     <meta content="yes" name="apple-mobile-web-app-capable">
     <meta content="black" name="apple-mobile-web-app-status-bar-style">
     <meta content="telephone=no" name="format-detection">
     <meta content="email=no" name="format-detection">
     <script>
            var httpDomain = {
                host:'<?php echo $api;?>',
                cdn:'<?php echo $cdn;?>'
            }
    </script>
</head>        
<body>
    <div id=app>
        <router-view></router-view>
    </div>
    
</body>
</html>
