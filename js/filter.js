/**
 * Created by DanielZhang on 2017/9/10.
 */
;(function ( filter, undefined ){
    var originData,
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
        originData = targetCtx.getImageData(0,0,imgWidth,imgHeight);

        fatherDiv.appendChild(targetCanvas);
    };

    //加权灰度法
    filter.weightedGray = function(){
        clearCanvas();
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i,
                    info = analysisPixel(originData.data,currentPixel),
                    gray = 0.3*info.r+0.59*info.g+0.11*info.b;
                setPixelInfo(originData.data,currentPixel,gray,gray,gray);
            }
        }
        targetCtx.putImageData(originData,0,0);
    };

    //平均值灰度法
    filter.averageGray = function(){
        clearCanvas();
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i,
                    info = analysisPixel(originData.data,currentPixel),
                    average = (info.r+info.g+info.b)/3;
                setPixelInfo(originData.data,currentPixel,average,average,average);
            }
        }
        targetCtx.putImageData(originData,0,0);
    };

    //绘制普通图
    filter.printOriginal = function(){
        targetCtx.putImageData(originData,0,0);
    };

    //最大值灰度法
    filter.maximumGray = function(){
        clearCanvas();
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i,
                    info = analysisPixel(originData.data,currentPixel),
                    gray = Math.max(info.r,info.g,info.b);
                setPixelInfo(originData.data,currentPixel,gray,gray,gray);
            }
        }
        targetCtx.putImageData(originData,0,0);
    };

    //反转颜色
    filter.invert = function(){
        clearCanvas();
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i,
                    info = analysisPixel(originData.data,currentPixel);
                setPixelInfo(originData.data,currentPixel,255-info.r,255-info.g,255-info.b);
            }
        }
        targetCtx.putImageData(originData,0,0);
    };

    //浮雕算法
    filter.relief = function(){
        clearCanvas();
        var lastR= originData.data[0],lastG= originData.data[1],lastB= originData.data[2];
        for (var i=1;i<imgWidth;i++){
            for (var j=1;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i;
                var r = originData.data[currentPixel],
                    g = originData.data[currentPixel+1],
                    b = originData.data[currentPixel+2];
                originData.data[currentPixel] +=(128-lastR);
                originData.data[currentPixel+1] +=(128-lastG);
                originData.data[currentPixel+2] +=(128-lastB);
                lastR = r;
                lastG = g;
                lastB = b;
            }
        }
        targetCtx.putImageData(originData,0,0);
    };

    //雾化算法
    filter.fog = function(threshold){
        clearCanvas();
        threshold = (threshold)?threshold:10;
        var lastR= originData.data[0],lastG= originData.data[1],lastB= originData.data[2];
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var num = Math.floor(Math.random()*threshold);
                var deltaX,deltaY;
                (i+num)<=imgWidth?deltaX=i+num:deltaX = i-1;
                (j+num)<=imgHeight?deltaY=j+num:deltaY = j-1;
                var currentPixel = 4*imgWidth*j + 4* i;
                var deltaPixel = 4*imgWidth*deltaY+4*deltaX;
                originData.data[currentPixel]=originData.data[deltaPixel];
                originData.data[currentPixel+1]=originData.data[deltaPixel+1];
                originData.data[currentPixel+2]=originData.data[deltaPixel+2];
            }
        }
        targetCtx.putImageData(originData,0,0);
    };

    //老照片算法
    filter.oldPhoto = function(){
        targetCtx.putImageData(createOverlay(153,253,153,188),0,0);
        //targetCtx.putImageData(AlphaBlend(originData,createOverlay(153,253,153,255),0.5),0,0);
    };

    //高斯特效
    filter.gaussBlur = function(){
        clearCanvas();
        var emptyData = copyPic(originData);
            delta = 3,
            blur_percent =  0.84089642,
            blurArr = setBlurArr(blur_percent,delta),
            thisX = 0,thisY = 0;
        for (var i=delta;i<imgWidth-delta;i++){
            for (var j=delta;j<imgHeight-delta;j++){
                var averageR = 0,averageG = 0,averageB = 0;
                var percentageArr = 0;
                for (var dx = -delta;dx<=delta;dx++){
                    for(var dy=-delta;dy<=delta;dy++){
                        var currentL = (2*delta+1)*(dy+delta)+(dx+delta);
                        var deltaX = i+ dx,
                            deltaY = j+ dy,
                            deltaNumber = 4*(deltaX + deltaY*(imgWidth));
                        if ((i+dx)>=0&&(i+dx)<= imgWidth&&(j+dy)>=0&&(j+dy)<= imgHeight){
                            averageR += originData.data[deltaNumber]*blurArr[currentL];
                            averageG += originData.data[deltaNumber+1]*blurArr[currentL];
                            averageB += originData.data[deltaNumber+2]*blurArr[currentL];
                        }else{
                            averageR += 255*blurArr[currentL];
                            averageG += 255*blurArr[currentL];
                            averageB += 255*blurArr[currentL];
                        }
                        percentageArr+= blurArr[currentL];
                    }
                }
                var currentPixel = 4*imgWidth*j + 4* i;
                emptyData.data[currentPixel] = averageR;
                emptyData.data[currentPixel+1] = averageG;
                emptyData.data[currentPixel+2] = averageB;
            }
        }
        originData = emptyData;
        targetCtx.putImageData(originData,0,0);
    };

    //锐化处理
    filter.sharpen = function(){
        clearCanvas();
        var emptyData = copyPic(originData),
            alpha = 0.3,
            delta;
        for (var i=1;i<imgWidth-1;i++) {
            for (var j = 1; j < imgHeight-1; j++) {
                var currentPixel = 4*imgWidth*j + 4* i,
                    deltaR = 0,deltaG = 0,deltaB = 0;
                for (var dx = -1;dx<=1;dx++){
                    for (var dy = -1;dy<=1;dy++){
                        var current = 4*imgWidth*(j+dy) + 4*(dx+i),
                            r = (originData.data[current])?originData.data[current]:255,
                            g = (originData.data[current+1])?originData.data[current+1]:255,
                            b = (originData.data[current+2])?originData.data[current+2]:255;
                        deltaR+=(r/8);
                        deltaG+=(g/8);
                        deltaB+=(b/8);
                    }
                }
                var currentR = originData.data[currentPixel],
                    currentG = originData.data[currentPixel+1],
                    currentB = originData.data[currentPixel+2];
                deltaR = currentR -deltaR;
                deltaG = currentG -deltaG;
                deltaB = currentB -deltaB;
                setPixelInfo(emptyData.data,currentPixel,currentR+deltaR*alpha,currentG+deltaG*alpha,currentB+deltaB*alpha);
            }
        }
        originData = emptyData;
        targetCtx.putImageData(originData,0,0);
    };

    //柔化处理
    filter.soften = function(){
        clearCanvas();
        var emptyData = copyPic(originData),
            alpha = 0.3,
            delta;
        for (var i=1;i<imgWidth-1;i++) {
            for (var j = 1; j < imgHeight-1; j++) {
                var currentPixel = 4*imgWidth*j + 4* i,
                    deltaR = 0,deltaG = 0,deltaB = 0;
                for (var dx = -1;dx<=1;dx++){
                    for (var dy = -1;dy<=1;dy++){
                        var current = 4*imgWidth*(j+dy) + 4*(dx+i),
                            r = (originData.data[current])?originData.data[current]:255,
                            g = (originData.data[current+1])?originData.data[current+1]:255,
                            b = (originData.data[current+2])?originData.data[current+2]:255;
                        deltaR+=(r/9);
                        deltaG+=(g/9);
                        deltaB+=(b/9);
                    }
                }
                emptyData.data[currentPixel] = deltaR;
                emptyData.data[currentPixel+1] = deltaG;
                emptyData.data[currentPixel+2] = deltaB;
            }
        }
        originData = emptyData;
        targetCtx.putImageData(originData,0,0);
    };

    //对比度变化
    filter.contrast = function(percent){
        clearCanvas();
        var average={
                r:0,
                g:0,
                b:0
            },
            totalNum = originData.data.length/4;
        for (var i = 0;i<(totalNum);i++){
            var currentNum = 4*i;
            average.r += (originData.data[currentNum]/totalNum);
            average.g += (originData.data[currentNum+1]/totalNum);
            average.b += (originData.data[currentNum+2]/totalNum);
        }
        for (var i=0;i<(totalNum);i++){
            currentNum = 4*i;
            originData.data[currentNum] = average.r + (originData.data[currentNum] - average.r)*(1+percent);
            originData.data[currentNum+1] = average.g + (originData.data[currentNum+1] - average.g)*(1+percent);
            originData.data[currentNum+2] = average.b + (originData.data[currentNum+2] - average.b)*(1+percent);
        }
        targetCtx.putImageData(originData,0,0);
    };

    //直方图均衡化
    filter.histogramEqualization = function(){
        imgData = originData.data;
        var grayAverage = [],hisData = [];
        //先灰度化
        for (var i=0;i<(imgData.length/4);i++){
            var currentNum = 4*i;
            grayAverage.push(findLowest(imgData[currentNum],imgData[currentNum+1],imgData[currentNum+2]));
            var low = findLowest(imgData[currentNum],imgData[currentNum+1],imgData[currentNum+2]);
            imgData[currentNum] = low;
            imgData[currentNum+1] = low;
            imgData[currentNum+2] = low;
        }
        for (var i=0;i<256;i++){
            hisData.push(0);
        }
        for (var j=0;j<grayAverage.length;j++){
            var current = grayAverage[j];
            hisData[current] = hisData[current]+1;
        }

        var cdbArr = [];
        var hNumber = [];
        for (var i=0;i<256;i++){
            var num = ((i==0)?0:cdbArr[i-1]);
            cdbArr.push(num+hisData[i]);
        }
        var cdfMin = 9999999,cdfMax = 0;
        for (var i=0;i<256;i++){
            var num = cdbArr[i];
            if (num>cdfMax){
                cdfMax = cdbArr[i];
            }
            if (num<cdfMin && num!=0){
                cdfMin = cdbArr[i];
            }
        }
        for (var i=0;i<256;i++){
            var number = Math.abs((cdbArr[i]-cdfMin)/(imgWidth*imgHeight-cdfMin)*255);
            hNumber.push(number);
        }
        for (var i=0;i<(imgData.length/4);i++){
            var currentNum = 4*i;
            imgData[currentNum] = hNumber[imgData[currentNum]];
            imgData[currentNum+1] = hNumber[imgData[currentNum+1]];
            imgData[currentNum+2] = hNumber[imgData[currentNum+2]];
        }
        targetCtx.putImageData(originData,0,0);
    };

    //RGB转HSV
    function RGBtoHSV(){
        var hsvArr = [];
        for (var j = 0;j<imgHeight;j++){
            hsvArr[j] = [];
            for (var i = 0;i<imgWidth;i++){
                var obj = {H:0,S:0,V:0},
                    currentLocation = 4*imgWidth*j + 4*i,
                    maxRGB =  getMaxRGB(currentLocation),
                    minRGB =  getMinRGB(currentLocation),
                    R =originData.data[currentLocation],
                    G =originData.data[currentLocation+1],
                    B =originData.data[currentLocation+2];
                obj.V = maxRGB;
                obj.S = obj.V - minRGB;
                if (R==maxRGB){
                    if(G>=B){
                        obj.H = 60*(G-B)/(obj.V-minRGB);
                    }else{
                        obj.H = 60*(G-B)/(obj.V-minRGB) + 360;
                    }
                }else if (G==maxRGB){
                    obj.H = (60*(B-R))/(obj.V-minRGB) + 120;
                }else if (B==maxRGB){
                    obj.H = (60*(R-G))/(obj.V-minRGB) + 240;
                }
                hsvArr[j][i] = obj;
            }
        }
    }

    //RGB转HSL
    function RGBtoHSL(){
        var hsvArr = [];
        for (var j = 0;j<imgHeight;j++){
            hsvArr[j] = [];
            for (var i = 0;i<imgWidth;i++){
                var obj = {H:0,S:0,L:0},
                    currentLocation = 4*imgWidth*j + 4*i,
                    maxRGB =  getMaxRGB(currentLocation),
                    minRGB =  getMinRGB(currentLocation),
                    R =originData.data[currentLocation],
                    G =originData.data[currentLocation+1],
                    B =originData.data[currentLocation+2];
                obj.L = maxRGB/2 + minRGB/2;
                obj.S = obj.V - minRGB;
                if (R==maxRGB){
                    if(G>=B){
                        obj.H = 60*(G-B)/(maxRGB-minRGB);
                    }else{
                        obj.H = 60*(G-B)/(maxRGB-minRGB) + 360;
                    }
                }else if (G==maxRGB){
                    obj.H = (60*(B-R))/(maxRGB-minRGB) + 120;
                }else if (B==maxRGB){
                    obj.H = (60*(R-G))/(maxRGB-minRGB) + 240;
                }
                hsvArr[j][i] = obj;
            }
        }
    }

    function getMinRGB(location){
        return (Math.min(Math.min(originData.data[location],originData.data[location+1]),originData.data[location+2]));
    }

    function getMaxRGB(location){
        return (Math.max(Math.max(originData.data[location],originData.data[location+1]),originData.data[location+2]));
    }

    //用来制作叠加图层
    function createOverlay(r,g,b,a){
        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");
        var overlayImgData = ctx.createImageData(imgWidth,imgHeight);
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i;
                overlayImgData.data[currentPixel] = r;
                overlayImgData.data[currentPixel+1] = g;
                overlayImgData.data[currentPixel+2] = b;
                overlayImgData.data[currentPixel+3] = a;
            }
        }
        return overlayImgData;
    }

    //深度复制
    function copyPic(targetData){
        var returnV = createOverlay(0,0,0,0);
        for (var i=0;i<imgWidth;i++){
            for (var j = 0;j<imgHeight;j++){
                var c = 4*imgWidth*j+4*i;
                returnV.data[c] = targetData.data[c];
                returnV.data[c+1] = targetData.data[c+1];
                returnV.data[c+2] = targetData.data[c+2];
                returnV.data[c+3] = targetData.data[c+3];
            }
        }
        return returnV;
    }

    //图像AlphaBlend算法
    function AlphaBlend(firstImg,secondImg,rate){
        var returnData = createOverlay(0,0,0,255);
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var currentPixel = 4*imgWidth*j + 4* i;
                returnData.data[currentPixel] = rate*firstImg.data[currentPixel]+(1-rate)*secondImg.data[currentPixel];
                returnData.data[currentPixel+1] = rate*firstImg.data[currentPixel+1]+(1-rate)*secondImg.data[currentPixel+1];
                returnData.data[currentPixel+2] = rate*firstImg.data[currentPixel+2]+(1-rate)*secondImg.data[currentPixel+2];
                returnData.data[currentPixel+2] = rate*firstImg.data[currentPixel+3]+(1-rate)*secondImg.data[currentPixel+3];
            }
        }
        return returnData;
    }

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

    //寻找rgb最小
    function findLowest(a,b,c){
        var lowest = a;
        if (a>b){
            lowest = b;
        }
        if (a>c){
            lowest = c;
        }
        return lowest;
    }

    //计算高斯数
    function setBlurArr(blur_percent,delta){
        var blur = [];
        for (var i= -delta;i<=delta;i++){
            for (var j= -delta;j<=delta;j++){
                blur.push((1/(2*Math.PI*blur_percent*blur_percent))*Math.pow(Math.E,(-(i*i+j*j)/(2*blur_percent*blur_percent))));
            }
        }
        return blur;
    }

    //设置像素
    function analysisPixel(data,num){
        return {r:data[num],g:data[num+1],b:data[num+2]};
    }
}( window.filter = window.filter || {} ));