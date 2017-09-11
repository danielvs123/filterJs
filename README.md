# filterJs
ImageFilter

USAGE:

filter.js is required
filter.js需要被引用

        filter.loadImgDiv("读取的img","嵌套在的父页面",宽度||不是必须，高度||不是必须);
        调用加权灰度
        filter.weightedGray();

        <img src="https://github.com/danielvs123/filterJs/blob/master/demo/weighted.jpeg" width = "20%;" />

        调用平均灰度
        filter.averageGray();

        <img src="https://github.com/danielvs123/filterJs/blob/master/demo/average.jpeg" width = "20%;" />

        调用最高灰度
        filter.maximumGray();

        <img src="https://github.com/danielvs123/filterJs/blob/master/demo/maximum.jpeg" width = "20%;" />

        反转颜色(底片特效)
        filter.invert();

        <img src="https://github.com/danielvs123/filterJs/blob/master/demo/invert.jpeg" width = "20%;" />

        浮雕算法
        filter.relief();

        <img src="https://github.com/danielvs123/filterJs/blob/master/demo/relief.jpeg" width = "20%;" />

        雾化算法
        filter.fog(15);

        <img src="https://github.com/danielvs123/filterJs/blob/master/demo/fog.jpeg" width = "20%;" />
