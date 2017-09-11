# filterJs
ImageFilter

USAGE:

filter.js is required
filter.js需要被引用

        filter.loadImgDiv("读取的img","嵌套在的父页面",宽度||不是必须，高度||不是必须);
        调用加权灰度
        filter.weightedGray();

        调用平均灰度
        filter.averageGray();

        调用最高灰度
        filter.maximumGray();

        反转颜色(底片特效)
        filter.invert();

        浮雕算法
        filter.relief();

        雾化算法
        filter.fog(15);
