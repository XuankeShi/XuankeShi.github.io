---
layout: page
permalink: /blogs/curlinghunter/index.html
title: 体育史上首个合法「AI外挂」！北京冬奥「猎壶者」决策仅需9毫秒，误差仅3cm
---

## 体育史上首个合法「AI外挂」！北京冬奥「猎壶者」决策仅需9毫秒，误差仅3cm

> 更新时间：2024/01/24       [English Version(英文)](https://curlinghunter.github.io/jekyll/update/2022/10/22/CurlingHunter.html)


<br>

将AI应用到体育上，是目前工业界与学术界普遍关注的问题，目前一些AI视觉分析系统已经应用到网球、篮球、足球、乒乓球上，最负盛名的莫过于应用于网球中的鹰眼系统，但是这些系统大都定位为「即时回放系统」，远非实时的系统。

事实上，将AI实时应用到体育运动中是一个极具挑战性的问题，体育比赛对AI系统的处理速度、精度和稳定性都具有较高的要求，真实的环境较为复杂，不确定性很多，这会极大地影响AI系统的性能。

<div align=right>
  <img src = "https://xuankeshi.github.io/blogs/curlinghunter.assets/curlinghunter_cover.png">
</div>

<br>

冰壶作为一项极其讲究策略和技巧的高脑力运动，有着「冰上国际象棋」的美誉，其起源于16世纪的苏格兰，自1998年起成为冬奥会的正式比赛项目。

在冰壶比赛过程中冰壶的实时运动状态、冰壶在大本营的分布情况对于运动员的决策起着至关重要的作用，而这对于冰壶比赛的胜负可以起到决定性的作用。然而，在实际的冰壶比赛中，缺乏这样的系统来实时显示这些信息用于辅助比赛。

<br>

## 系统架构

<br>

2022年北京冬奥会冰壶比赛在北京「冰立方」举行（图1a），这是奥运会历史上最大的冰壶场馆。

基于此，由商汤科技主导研发的AI冰壶赛事系统**猎壶者（CurlingHunter）**应运而生，其作为**全球第一个实时用于冰壶赛事的AI跨相机多目标追踪系统**，也是体育史上首个用于冰壶比赛的AI实时系统，成功应用于2022年**北京冬季奥运会**和**冬残奥会**。

<div align=right>
  <img src = "https://xuankeshi.github.io/blogs/curlinghunter.assets/Components.jpg">
</div>

<br>

CurlingHunter 由 42 个摄像机组成，排列在「冰立方」中（图 1a），相机视野重叠（图 1b），确保赛道的每一部分都至少被三个摄像头从不同角度拍摄，以此解决运动场中的人、桁架、摄像头等遮挡问题。摄像头布置在三个不同高度，它们分布在赛道周围，包括球机和枪机两种类型（图1c）。冰壶场馆东侧放置了一个170平米的大屏幕，实时地显示冰壶的运动状态并预测未来轨迹（图1a），以帮助运动员进行策略的调整，同时提升观众的观赛体验。由于实际比赛中的诸多不确定性，准确实时的捕捉冰壶轨迹具有十足的挑战性，这涉及到单相机多目标跟踪、跨相机多目标追踪、大场景图像畸变校正、冰壶视觉定位等诸多问题。
CurlingHunter 将这些问题分解为模块化的任务。有趣的是，其中一些任务在实际的冰壶比赛中被提出，例如大环境中小目标的最优跟踪策略、冰面上目标的视觉定位、大场景中的图像失真校正、多相机数据关联等，推动了AI领域一些新方法的提出与应用。图1d展示了CurlingHunter 的主要模块以及它们是如何处理来自前一个模块的信息。

CurlingHunter主要由三个模块组成：单相机跟踪与视觉定位（图2a）、跨相机数据关联与轨迹生成（图2b）、运动分析与轨迹预测（图2c）。

<div align=right>
  <img src = "https://xuankeshi.github.io/blogs/curlinghunter.assets/Methods.jpg">
</div>

1. 第一个模块为单相机多目标追踪及冰壶视觉定位，由42路相机同步并行执行。通过第一个模块，我们可以获得每个相机的跨帧数据关联，由于单视角的频繁遮挡现象，这一步骤仅仅能形成单个视角下频繁间断的轨迹段（Tracklet）。

2. 在第二个模块中，引入了时间同步模块来矫正多个相机之间的信息。设计了基于长短期记忆匹配机制（LSTMM）的跨相机数据关联方法，该方法采用了跨越时空的贪心区域增长算法，高效的解决了冰壶的跨相机信息同步问题。最后， 我们通过多相机融合，实时的还原冰壶的位置和姿态。

3. 在第三模块中，我们利用非对称加权最小二乘法（AWLS）实时计算冰壶石的速度、加速度和角速度，并提出了一个基于LSTM的模型来实时预测冰壶的未来轨迹。
<br>
最后，将CurlingHunter成功应用于2021年轮椅冰壶世锦赛、2022年北京冬奥会、2022年北京冬残奥会，CurlingHunter取得了优异的成绩，得到了世界冰壶联合会主席Kate Caithness、运动员、教练员、裁判员、观众、解说员、媒体等的高度赞扬。 

## 结果展示

<div align=right>
  <img src = "https://xuankeshi.github.io/blogs/curlinghunter.assets/Reports.jpg">
</div>
<br>
通过CurlingHunter现场170平方米的大屏（图3a、图3b），运动员可以更好、更科学地制定比赛策略。冰壶赛道很长，运动员距离大本营有几十米，仅仅依靠运动员的眼睛，很难做到准确定位冰壶在几十米外大本营的分布情况，更难了解冰壶轨迹的全貌。CurlingHunter很好地解决了这些问题。通过观看大屏幕，运动员可以清楚地知道冰壶的实际位置、实际轨迹、预测轨迹、本次投掷的具体情况及下一次投掷的纠正方法，这极大地解放了运动员的记忆力，从而更好地辅助运动员进行比赛。 


## 结论

<br>

这项工作开发了一个实时AI冰壶赛事系统CurlingHunter，具有出色的实时性（~ 9.005 ms）、较高的精度（测量距离>20 m下30±3 cm）和良好的稳定性，并成功应用于实际的冰壶比赛，填补了实时辅助冰壶比赛这一领域的空白。

- CurlingHunter是体育历史上第一个辅助运动员比赛的实时AI系统，并成功应用于冬奥会和残奥会。

- 这项工作极大地促进了AI技术在实际环境中的落地实用，同时也极大地促进了冰壶运动的发展。

- 此外，CurlingHunter为进一步扩展到其他的体育运动及应用到跨相机多目标追踪的学术研究提供了一个新的平台。

## **Media Reports**

[CCTV5](https://2022.cctv.com/2022/03/02/VIDEo6c7b8tv2DhGSIeAwrnY220302.shtml) | 
[CCTV10](https://tv.cctv.com/2022/02/17/VIDEYNtTNJj9Jkbg0HD0hMME220217.shtml?spm=C53121759377.PvNzMjwOU8x4.0.0) |
[WAIC 2022](http://sh-aia.com/dynamics/detail389.htm) | 
[中国工业新闻网](http://www.cinn.cn/dfgy/202202/t20220216_252673_wap.html) | 
[中华网](https://www.baidu.com/link?url=XNs_ZUGZHU1_ta0oC--VvYEjBRtK0YTgE5aF9LoGn_jOIxhLiU5t83ON-noDK6nA7IgmWdkH3XTPKmlxiQwnCsCbhZeCBuSqU_YaBmEaonC&wd=&eqid=bb8aba1e000921f0000000036353c367) | 
[浙江省经济和信息化厅](https://jxt.zj.gov.cn/art/2022/2/22/art_1657979_58928232.html) | 
[新民晚报](https://baijiahao.baidu.com/s?id=1724073030087092396&wfr=spider&for=pc) |  
[腾讯新闻](https://new.qq.com/rain/a/20211030A0446N00) | 
[搜狐](https://www.sohu.com/a/498023908_120181749) | 
[体坛网](http://www.titan24.com/publish/app/data/2020/04/26/315681/os_news.html) | 
[一点资讯](http://hw.yidianzixun.com/article/0bHe9PzU?s=hwbrowser&appid=hwbrowser&s_real=hwbrowser&ctype=news&from_related=1) | 
[上观网](https://export.shobserver.com/baijiahao/html/447890.html) | 
[财视传媒](https://www.baidu.com/link?url=8PENrdD4JtTbU4FRLbMgAmKw8P5l1K8k2sP9R_-Hprk-11CvYGXxTie0ZzFDkRqJLBGjRpDNM8jbqds-ReyDXOeNqOA1TgP07MLuOgZ30yG&wd=&eqid=bca23d5b001ccf48000000036353c1a0) | 
[智驾网](https://baijiahao.baidu.com/s?id=1724791100724675147&wfr=spider&for=pc) | 
[商汤科技](https://www.sensetime.com/cn/news-detail/41164739) | 
[科创版日报](https://baijiahao.baidu.com/s?id=1729136742236108141&wfr=spider&for=pc) | 
[中国经营报](https://baijiahao.baidu.com/s?id=1724508134127922968&wfr=spider&for=pc) | 
[红星新闻](https://baijiahao.baidu.com/s?id=1728608215909288051&wfr=spider&for=pc) | 
[科技湃](https://page.om.qq.com/page/OLcb7f1Zh26fP2HlVty6z1cg0) | 
[北晚在线](https://www.takefoto.cn/news/2022/02/25/10047236.shtml) | 