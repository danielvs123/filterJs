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

    //绘制普通图
    filter.printOriginal = function(){
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

    //老照片算法
    filter.oldPhoto = function(){
        targetCtx.putImageData(createOverlay(153,253,153,188),0,0);
        //targetCtx.putImageData(AlphaBlend(imgData,createOverlay(153,253,153,255),0.5),0,0);
    };

    //高斯特效
    filter.gaussBlur = function(){
        clearCanvas();
        var emptyData = createOverlay(0,0,0,255),
            delta = 2,
            blur_percent =  0.84089642,
            blurArr = setBlurArr(blur_percent,delta),
            thisX = 0,thisY = 0;
        for (var i=0;i<imgWidth;i++){
            for (var j=0;j<imgHeight;j++){
                var averageR = 0,averageG = 0,averageB = 0;
                var percentageArr = 0;
                for (var dx = -delta;dx<=delta;dx++){
                    for(var dy=-delta;dy<=delta;dy++){
                        var currentL = (2*delta+1)*(dy+delta)+(dx+delta);
                        var deltaX = i+ dx,
                            deltaY = j+ dy,
                            deltaNumber = 4*(deltaX + deltaY*(imgWidth));
                        if ((i+dx)>=0&&(i+dx)<= imgWidth&&(j+dy)>=0&&(j+dy)<= imgHeight){
                            averageR += imgData.data[deltaNumber]*blurArr[currentL];
                            averageG += imgData.data[deltaNumber+1]*blurArr[currentL];
                            averageB += imgData.data[deltaNumber+2]*blurArr[currentL];
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
        console.log(emptyData.data);
        console.log(imgData.data);
        targetCtx.putImageData(emptyData,0,0);
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
                    R =imgData.data[currentLocation],
                    G =imgData.data[currentLocation+1],
                    B =imgData.data[currentLocation+2];
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
                    R =imgData.data[currentLocation],
                    G =imgData.data[currentLocation+1],
                    B =imgData.data[currentLocation+2];
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
        return (Math.min(Math.min(imgData.data[location],imgData.data[location+1]),imgData.data[location+2]));
    }

    function getMaxRGB(location){
        return (Math.max(Math.max(imgData.data[location],imgData.data[location+1]),imgData.data[location+2]));
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