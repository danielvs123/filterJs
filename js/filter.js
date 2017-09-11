/**
 * Created by DanielZhang on 2017/9/10.
 */
;(function ( filter, undefined ){
    var imgData,
        targetCanvas,
        targetCtx,
        imgWidth,
        imgHeight,
        fatherDiv;
    filter.loadImgDiv = function(divName,fatherDiv,width,height){
        var div = document.getElementById(divName);
        fatherDiv = document.getElementById(fatherDiv);
        targetCanvas = document.createElement("canvas");
        imgWidth = (width)?width:div.clientWidth;
        imgHeight = (height)?height:div.clientHeight;
        targetCanvas.width = imgWidth;
        targetCanvas.height = imgHeight;
        targetCtx = targetCanvas.getContext("2d");
        targetCtx.drawImage(div,0,0,imgWidth,imgHeight);
        imgData = targetCtx.getImageData(0,0,imgWidth,imgHeight);

        fatherDiv.appendChild(targetCanvas);
    };

    //加权灰度法
    filter.weightedGray = function(){
        clearCanvas();
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i,
                    info = analysisPixel(imgData.data,currentPixel),
                    gray = 0.3*info.r+0.59*info.g+0.11*info.b;
                setPixelInfo(imgData.data,currentPixel,gray,gray,gray);
            }
        }
        targetCtx.putImageData(imgData,0,0);
    };

    //平均值灰度法
    filter.averageGray = function(){
        clearCanvas();
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i,
                    info = analysisPixel(imgData.data,currentPixel),
                    average = (info.r+info.g+info.b)/3;
                setPixelInfo(imgData.data,currentPixel,average,average,average);
            }
        }
        targetCtx.putImageData(imgData,0,0);
    };

    //最大值灰度法
    filter.maximumGray = function(){
        clearCanvas();
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i,
                    info = analysisPixel(imgData.data,currentPixel),
                    gray = Math.max(info.r,info.g,info.b);
                setPixelInfo(imgData.data,currentPixel,gray,gray,gray);
            }
        }
        targetCtx.putImageData(imgData,0,0);
    };

    //反转颜色
    filter.invert = function(){
        clearCanvas();
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i,
                    info = analysisPixel(imgData.data,currentPixel);
                setPixelInfo(imgData.data,currentPixel,255-info.r,255-info.g,255-info.b);
            }
        }
        targetCtx.putImageData(imgData,0,0);
    };

    //浮雕算法
    filter.relief = function(){
        clearCanvas();
        var lastR= imgData.data[0],lastG= imgData.data[1],lastB= imgData.data[2];
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i;
                var r = imgData.data[currentPixel],
                    g = imgData.data[currentPixel+1],
                    b = imgData.data[currentPixel+2];
                imgData.data[currentPixel] +=(128-lastR);
                imgData.data[currentPixel+1] +=(128-lastG);
                imgData.data[currentPixel+2] +=(128-lastB);
                lastR = r;
                lastG = g;
                lastB = b;
            }
        }
        targetCtx.putImageData(imgData,0,0);
    };

    //雾化算法
    filter.fog = function(threshold){
        clearCanvas();
        threshold = (threshold)?threshold:10;
        var lastR= imgData.data[0],lastG= imgData.data[1],lastB= imgData.data[2];
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var num = Math.floor(Math.random()*threshold);
                var deltaX,deltaY;
                (i+num)<=imgWidth?deltaX=i+num:deltaX = i-1;
                (j+num)<=imgHeight?deltaY=j+num:deltaY = j-1;
                var currentPixel = 4*imgWidth*j + 4* i;
                var deltaPixel = 4*imgWidth*deltaY+4*deltaX;
                imgData.data[currentPixel]=imgData.data[deltaPixel];
                imgData.data[currentPixel+1]=imgData.data[deltaPixel+1];
                imgData.data[currentPixel+2]=imgData.data[deltaPixel+2];
            }
        }
        targetCtx.putImageData(imgData,0,0);
    };

    //设置像素
    function setPixelInfo(data,num,r,g,b){
        data[num] = r;
        data[num+1] = g;
        data[num+2] = b;
    }

    //清楚canvas
    function clearCanvas(){
        targetCtx.clearRect(0,0,imgWidth,imgHeight);
    }

    //设置像素
    function analysisPixel(data,num){
        return {r:data[num],g:data[num+1],b:data[num+2]};
    }
}( window.filter = window.filter || {} ));