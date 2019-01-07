#! /bin/bash
cd ../
#svn checkout svn://192.168.31.221/WEB/share/linux_node_modules/
#chmod -R 777 node_modules
#tar -zcvf node_modules.tar.gz  liunx下 先npm rebuild node-sass  然后再打包 则ok 在 svn add commit

LINK=./node_modules
if [ ! -d "$LINK" ];then
        ln -s /opt/local/node_modules node_modules
fi
chmod -R 777 node_modules
npm run build
