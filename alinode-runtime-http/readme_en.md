# 快速部署一个 http 类型的函数到阿里云计算

## 简介

使用此应用，您可以快速部署一个 http 类型的函数到阿里云计算；同时，如果您部署了 Alinode Insight 应用，您将可以在 Alinode Insight 应用下对此 http 函数进行监控。详情可以在 serverlessdevs tools 中搜索 `alinode-faas-insight` 查看。

## 开发

/code/index.js 为您的业务代码入口，您可以将您的业务代码放在 /code/目录下

## 发布

您可以通过编写 `template.yaml` 来修改您的服务名、函数名等信息
您可以通过 serverlessdevs tools gui 界面进行发布部署，也可以在项目目录下执行 `s deploy` 进行部署。

## 注意事项

为了确保 Alinode Insight 能监控到您的应用，请在 fc 控制台配置初始化函数、PreStop 函数、PreFreeze 函数。配置路径为 `函数 -> 概览 -> 修改配置 -> 扩展函数`。具体配置如下图
[!https://img.alicdn.com/imgextra/i3/O1CN01mnWpyq1t1E5sovN9M_!!6000000005841-2-tps-1604-870.png]
