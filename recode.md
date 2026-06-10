```cmd

npm init -y
npm i puppeteer puppeteer-screen-recorder

node .\record.js

set RECORD_WIDTH=2560
set RECORD_HEIGHT=1360
set RECORD_FPS=30
set RECORD_BITRATE=12000000
node .\record.js

:: 二次压缩（可选）
ffmpeg -i ".\out\record_xxx.mp4" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart ".\out\record_xxx_hq.mp4"

```