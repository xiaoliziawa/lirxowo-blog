---
title: Markdown 扩展语法速查
published: 2026-09-10T15:30:00+08:00
description: 本站支持的全部 Markdown 扩展语法，源码与渲染效果对照
tags: [Markdown, 建站, 速查]
category: 技术
---

这篇把本站能用的 Markdown 扩展全部列一遍，每节都是「源码 + 实际效果」对照，以后写文章直接翻这里。

## 提示块

### 三种写法

~~~markdown
:::note[可选标题]
方括号写标题。
:::

:::warning{title="请注意"}
花括号写标题。
:::

> [!TIP] GitHub 风格
> 必须带感叹号，而且每一行都要有 >。
~~~

不写标题时，标题栏会自动显示类型名的大写形式。

### 五种样式

:::note[note 蓝色]
用于补充说明。
:::

:::tip[tip 绿色]
用于技巧和建议。
:::

:::important[important 紫色]
用于关键信息。
:::

:::warning[warning 黄色]
用于需要留意的地方。
:::

:::caution[caution 红色]
用于危险操作的警告。
:::

### 别名

底层只有上面五套配色，其余关键词都会映射过去：

| 实际样式 | 可用关键词 |
| :--- | :--- |
| note | `note` `info` `abstract` `summary` `tldr` `todo` `example` `quote` `cite` |
| tip | `tip` `hint` `success` `check` `done` |
| important | `important` `question` `help` `faq` |
| warning | `warning` `attention` |
| caution | `caution` `error` `danger` `bug` `failure` `fail` `missing` |

比如 `info` 和 `error` 就是这么来的：

> [!INFO] info 映射到 note
> 所以它是蓝色的。

> [!ERROR] error 映射到 caution
> 红色，和 danger、bug 共用同一套样式。

:::caution[没有 WARN]
只认全称 `warning`。写成 `[!WARN]` 不会渲染成提示块，会退化成普通引用。
:::

## GitHub 仓库卡片

注意是**两个冒号**的行内指令，不能有内容体，写成三个冒号会失效。

~~~markdown
::github{repo="owner/repository"}
~~~

效果：

::github{repo="LyraVoid/Mizuki"}

star、fork、license 和语言都是前端实时拉取的。

## 图片网格

### 手动网格

~~~markdown
:::grid{columns="3" aspect="16/9" fit="cover"}
![图一](/images/albums/AcgExample/1.webp)

![图二](/images/albums/AcgExample/2.webp)

![图三](/images/albums/AcgExample/3.webp)
:::
~~~

`columns` 取 1 到 6，默认 3；`aspect` 默认 `16 / 10`；`fit` 是 `cover` 或 `contain`，默认 `cover`。

:::grid{columns="3" aspect="16/9" fit="cover"}
![图一](/images/albums/AcgExample/1.webp)

![图二](/images/albums/AcgExample/2.webp)

![图三](/images/albums/AcgExample/3.webp)
:::

### 自动网格

本站开启了自动网格，连续两张以上的纯图片段落会自己排成网格，最多 4 列，不用写 `:::grid`：

![自动一](/images/albums/AcgExample/4.webp)

![自动二](/images/albums/AcgExample/cover.webp)

每个网格都是独立的 Fancybox 灯箱分组，点开可以左右切换。

## Wiki Link

~~~markdown
[[record]]
[[ai-radar|行内链接文字]]
[[record#标题锚点|带锚点跳转]]
~~~

单独占一行会渲染成文章卡片：

[[record]]

行内则是普通站内链接，比如去看 [[ai-radar|AI 雷达那篇]]，就这样嵌在句子里。找不到目标时会原样保留，不会导致构建失败。

## Spoiler 遮罩

~~~markdown
答案是 :spoiler[鼠标划过才能看见]。
~~~

效果：答案是 :spoiler[鼠标划过才能看见]。

:::warning
只是视觉遮罩，源码里明文可见，别拿来藏敏感信息。要真正加密请用 frontmatter 的 `encrypted` 字段。
:::

## 代码块

主题跟随亮暗色切换，默认自动换行，右上角有语言角标和复制按钮。超过 20 行会自动折叠，只留 10 行预览，默认收起。

行号默认显示。`shellsession` 强制不显示行号，`bash` / `shell` / `sh` / `zsh` 使用无标题栏的窄边框样式：

```bash
pnpm install
pnpm dev
```

```python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b
```

### 代码组

~~~~markdown
::: code-group labels=[npm, pnpm, yarn]

```bash
npm install mizuki
```

```bash
pnpm add mizuki
```

:::
~~~~

`:::` 后面必须留一个空格再写 `code-group`，否则会被提示块的解析器抢走。效果：

::: code-group labels=[npm, pnpm, yarn]

```bash
npm install mizuki
```

```bash
pnpm add mizuki
```

```bash
yarn add mizuki
```

:::

## 数学公式

行内用单个 `$`，独立公式用两个 `$$`，构建时由 KaTeX 渲染成静态 HTML。

~~~markdown
质能方程 $E = mc^2$ 是行内公式。

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$
~~~

效果：质能方程 $E = mc^2$ 是行内公式。

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

## Mermaid

~~~~markdown
```mermaid
graph LR
    A[写文章] --> B[git push]
    B --> C[自动构建]
    C --> D[部署上线]
```
~~~~

效果：

```mermaid
graph LR
    A[写文章] --> B[git push]
    B --> C[自动构建]
    C --> D[部署上线]
```

## PlantUML

语法是 `plantuml` 代码围栏，但本站**当前已关闭**这个功能。

开关在 `src/config/markdownConfig.ts`。关闭的原因是渲染需要把图表源码发送到第三方公共服务器，要用的话得先自建 PlantUML 服务器再打开。

## 图片

~~~markdown
![相对路径](./diagram.webp)
![public 目录](/images/diary/sakura.webp)
![远程图片](https://example.com/image.webp)
![缩放并居中 w-60%](/images/diary/sakura.webp "这里是图注")
~~~

相对路径按当前文章所在目录解析，`/` 开头指向 `public/`。在 alt 文本里写 `w-N%`（1 到 100）可以设定宽度并自动居中，第三个参数是图注：

![樱花 w-60%](/images/diary/sakura.webp "带图注的樱花")

## 不用写语法，自动生效的

- 标题自动生成锚点，鼠标悬停出现 `#` 链接
- 表格自动包进横向滚动容器，窄屏不会撑破布局
- 站外链接自动加 `target="_blank"` 和 `nofollow noopener noreferrer`
- 章节自动 sectionize，配合右侧目录联动
- 全文自动进入 Pagefind 搜索索引

## frontmatter 的日期格式

最后记一个坑。`published` 只写日期时，同一天的多篇文章时间戳完全相同，排序会退化成按文件名字母序：

~~~yaml
published: 2026-09-10
~~~

要精确控制顺序就带上时间，并且**必须写时区偏移**：

~~~yaml
published: 2026-09-10T15:30:00+08:00
~~~

不带 `+08:00` 的话 YAML 会按 UTC 解析，晚上的文章日期会跳到第二天。页面上显示的仍然只有年月日，时分秒只参与排序。

:::tip[混用规则]
纯日期等价于当天上海时间 08:00。同一天有多篇文章时建议全部带上时间，别混着写。
:::
