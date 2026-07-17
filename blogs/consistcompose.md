---
layout: page
permalink: /blogs/consistcompose/index.html
title: CVPR 2026 新作：AI 绘画正式迈入「所控即所得」时代
---

## CVPR 2026 新作：AI 绘画正式迈入「所控即所得」时代

> 发布时间：2026/07/05  
> 本文根据[量子位报道](https://www.eeworld.com.cn/emp/QbitAI/a432860.jspx)整理。

如今的图像生成模型已经能够生成细节丰富、语义贴合的画面，但对真实创作来说，仅仅“画得好看”还不够。海报设计、电商主图和封面创作往往有明确的版式要求：主体必须出现在指定区域，关键元素需要保持特定位置，参考图中的人物或对象也要在生成结果中维持稳定的身份特征。

来自商汤科技研究团队的 CVPR 2026 论文 **ConsistCompose: Unified Multimodal Layout Control for Image Composition**，尝试将图像生成从“所想即所得”推进到“所控即所得”——模型不仅要理解“画什么”，还要准确执行“画在哪里”。

<figure>
  <img src="{{ '/blogs/consistcompose.assets/title-authors.webp' | relative_url }}" alt="ConsistCompose 论文标题、作者和商汤科技研究团队信息">
  <figcaption align="center">ConsistCompose 论文及作者团队。</figcaption>
</figure>

<div align="center">
  <img src="{{ '/images/paper/consistcompose.webp' | relative_url }}" alt="ConsistCompose 布局控制、图像元素重排和多主体生成示例">
</div>

<br>

## 精准布局为什么仍是难题？

对于海报设计、电商主图、封面创作等专业场景，图像不只需要“好看”，还需要严格符合预设版式——哪个主体在左、哪个元素在右，都不能出错。

<figure>
  <img src="{{ '/blogs/consistcompose.assets/layout-comparison.webp' | relative_url }}" alt="ChatGPT Image 2.0、Nano Banana 2 与 ConsistCompose 的布局控制能力对比">
  <figcaption align="center">通用图像生成模型与 ConsistCompose 的布局控制能力对比。</figcaption>
</figure>

面对“生成一只猫，并指定猫、猫爪、门和地板等元素的具体位置”这样的要求，通用模型仍可能生成语义正确、画面自然，却不符合目标空间约束的结果。

现有布局控制方法大致有两条技术路线：

1. **引入额外控制模块**：通过专用模块或区域注意力机制引导生成，但这类方案通常与具体模型架构绑定，难以迁移到统一多模态框架。
2. **将布局视为独立模态**：使用专门的空间 token 显式建模位置，却会带来多模态融合和泛化方面的新问题。

两条路线面对的是同一个核心问题：布局控制往往被当成附加能力，而不是模型原生输入接口的一部分。

ConsistCompose 给出的思路是：在统一多模态模型已有的语言—视觉接口中，直接表达并执行实例级布局约束。

## 三位一体的技术框架

ConsistCompose 的完整方案由三个部分组成：

- **ICBP（Instance-Coordinate Binding Prompt，实例坐标绑定提示）**：解决“如何表达布局”；
- **Coordinate-CFG（坐标无分类器引导）**：解决“如何执行布局”；
- **ConsistCompose3M 数据集**：解决“如何让模型学习布局”。

<figure>
  <img src="{{ '/blogs/consistcompose.assets/framework.webp' | relative_url }}" alt="ConsistCompose 统一多模态生成框架和实例坐标绑定提示结构">
  <figcaption align="center">ConsistCompose 框架：参考图像、文本与实例坐标在统一多模态模型中共同建模。</figcaption>
</figure>

### ICBP：把坐标写进语言序列

ICBP 将每个实例的文字描述与归一化坐标直接绑定。例如：

```text
A cat [0.109, 0.297, 0.607, 0.870]
has extended paw [0.497, 0.566, 0.564, 0.642].
```

在这种表示方式下，“cat”和“paw”不仅是语义描述，还与明确的空间区域建立了对应关系。文本、坐标、参考图像和生成目标由同一套序列建模框架统一处理。

这一设计复用了统一多模态模型已有的语言理解能力，不需要增加新的模态分支或专用空间编码器，因此架构改动和迁移成本都比较小。

### Coordinate-CFG：解耦内容与布局

当内容条件和布局条件同时写入一个序列时，调整布局可能会连带影响内容生成。Coordinate-CFG 在推理阶段加入可调节的坐标引导强度，将“画什么”和“画在哪里”拆分成两个可以独立干预的维度：

<figure>
  <img src="{{ '/blogs/consistcompose.assets/coordinate-cfg.webp' | relative_url }}" alt="Coordinate-CFG 从 0.0 增加到 0.4 时摩托车及其前后轮的布局控制效果">
  <figcaption align="center">Coordinate-CFG 在不同引导强度下的布局控制效果。</figcaption>
</figure>

- 引导较弱时，模型保留更多生成自由度，画面更加自然；
- 引导增强时，模型会更严格地执行空间约束，对象与目标区域的对齐精度随之提高。

它的思路与经典的无分类器引导（CFG）相似，但控制目标专门针对坐标条件。从摩托车示例可以看到，随着 Coordinate-CFG 从 0.0 增加到 0.4，摩托车整体、前轮和后轮与目标区域的对齐程度逐步提高，同时保持了图像质量与自然性。

### ConsistCompose3M：学习多主体组合

<figure>
  <img src="{{ '/blogs/consistcompose.assets/dataset.webp' | relative_url }}" alt="ConsistCompose3M 中布局可控文本到图像和多参考图像生成样本">
  <figcaption align="center">ConsistCompose3M 数据示例，覆盖布局标注与多参考图像组合。</figcaption>
</figure>

论文构建了约 **340 万样本**的 ConsistCompose3M 数据集，其中：

- 约 260 万条是布局可控的文本到图像样本；
- 约 80 万条是多参考图像条件生成样本。

数据覆盖对象与坐标绑定、多主体空间共存、参考主体身份保持，以及复杂布局下的整体画面组织。模型因此不仅能把单个对象放到指定位置，还能系统地学习多元素空间关系和主体一致性。

三者共同构成了从表示、推理到学习的闭环：ICBP 提供布局表达接口，Coordinate-CFG 提供可调节的推理引导，ConsistCompose3M 则提供大规模训练数据。

## 实验结果

### 布局可控文本到图像生成

在 COCO-Position 布局控制基准上，ConsistCompose 的平均实例生成成功率达到 **91.9%**，平均图像生成成功率达到 **75.7%**，mIoU 为 **84.3**，AP 为 **70.9**。与表中表现最好的对比方法相比，mIoU 提升 6.2 个百分点，AP 提升 13.7 个百分点。

<figure>
  <img src="{{ '/blogs/consistcompose.assets/coco-position-table.webp' | relative_url }}" alt="ConsistCompose 与其他方法在 COCO-Position 基准上的定量结果">
  <figcaption align="center">COCO-Position 定量对比，粗体表示最佳结果。</figcaption>
</figure>

这意味着实例生成成功率和位置准确性可以同时提高，而不是通过牺牲对象完整性来换取位置精度。

<figure>
  <img src="{{ '/blogs/consistcompose.assets/coco-position-comparison.webp' | relative_url }}" alt="ConsistCompose 与其他布局可控图像生成方法的定性对比">
  <figcaption align="center">COCO-Position 定性对比：不同方法对多对象位置约束的执行效果。</figcaption>
</figure>

### 多参考图布局可控生成

在更复杂的多参考图条件下，ConsistCompose 在 MS-Bench 和 MS-Bench-Random 的 DINO、mIoU、AP 等关键指标上也取得了领先结果。定性结果显示，模型能够在维持主体外观和身份特征的同时，让对象更准确地落入指定区域，并保持整体画面的自然性。

<figure>
  <img src="{{ '/blogs/consistcompose.assets/ms-bench-table.webp' | relative_url }}" alt="ConsistCompose 与其他方法在 MS-Bench 和 MS-Bench-Random 上的定量结果">
  <figcaption align="center">MS-Bench 与 MS-Bench-Random 定量对比。</figcaption>
</figure>

<figure>
  <img src="{{ '/blogs/consistcompose.assets/ms-bench-comparison.webp' | relative_url }}" alt="ConsistCompose 与其他方法在多参考图布局生成任务上的定性对比">
  <figcaption align="center">多参考图布局生成对比：ConsistCompose 更好地兼顾主体身份和空间位置。</figcaption>
</figure>

## 从“生成内容”到“执行设计”

ConsistCompose 直接面向三类实际创作场景：

1. **布局可控生成**：通过文本和坐标精确指定对象位置，适用于海报、电商主图和封面设计；
2. **图像元素重排**：保留原图中的视觉元素，同时重新编排空间关系，实现“换版式，不换素材”；
3. **多主体一致性生成**：从多张参考图中提取不同主体，按照指定布局组合到同一画面，并保持各主体的身份特征。

这项工作的价值不只在于布局控制本身。它进一步说明，空间结构也可以被纳入统一多模态模型的语言表达和推理框架。当模型能够自然地理解并执行布局约束时，图像生成便开始从单纯的内容生成，走向更可控、更可执行的视觉创作。

## 项目链接

- [论文（CVPR 2026）](https://openaccess.thecvf.com/content/CVPR2026/papers/Shi_ConsistCompose_Unified_Multimodal_Layout_Control_for_Image_Composition_CVPR_2026_paper.pdf)
- [项目主页](https://opensensenova.github.io/ConsistCompose/)
- [GitHub](https://github.com/OpenSenseNova/ConsistCompose)
- [Hugging Face 模型](https://huggingface.co/sensenova/ConsistCompose-BAGEL-7B-MoT)
- [ConsistCompose3M 数据集](https://huggingface.co/datasets/sensenova/ConsistCompose3M)
