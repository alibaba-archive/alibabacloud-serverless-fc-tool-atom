# Alinode Insight，快速部署一个 Nodejs http 函数监控平台

## 简介

使用此应用，您可以快速部署一个 apm 平台到阿里云计算，对 alinode-runtime-http 部署的函数进行监控；
在部署了 Alinode Insight 应用后，您将可以监控您的 http 类型函数（必须使用 `alinode-runtime-http` 部署的函数）；
Alinode Insight 采用了 [OpenTelemetry](https://opentelemetry.io/) 的数据模型的自定义集合，可以很方便地将 OpenTelemetry 数据导出为 Alinode Insight 格式。
Alinode Insight 为您提供指标、链路、异常三个维度的监控；同时提供了崩溃诊断的功能，方便您对函数的异常退出进行问题定位。

## 注意事项

1. 由于 Alinode Insight 使用了 sls 作为底层存储，请确保您使用的主账号开通了对应地域的 `sls` 服务，以及 `sls` 的 `数据加工`、`时序存储metrcstore`功能。Alinode Insight 在部署的时候，将自动为您创建对应的底层存储。
2. 如果您想使用崩溃诊断功能，请确保您使用的主账号开通了对应地域的 `oss` 服务，因为 Alinode Insight 中，诊断报告需要上传到 `oss` 中。同时需要您手动创建 `alinode-insight-{region}` bucket 供 Alinode Insight 使用。否则，可能会出现无法获取诊断报告的情况。
3. 自定义域名绑定，由于 fc http 触发器函数不能直接通过浏览器访问，需要绑定自定义域名才可以，详情参考[fc 文档](https://help.aliyun.com/document_detail/90763.html)
4. 确保您部署时使用的账号是主账号，有创建 ram 角色和授权策略的权限。Alinode Insight 会创建 ram 角色来向 1、2 点中提到的 sls 投递数据、向 oss 中上报和读取崩溃报告。Alinode Insight 所使用的角色、权限、数据存储都在您自己的账号中，您可以随时查看授权和数据使用情况，最大程度避免您的数据泄露。
5. Alinode Insight 集成了账号密码登录功能，来提高您的 apm 平台的访问安全性，您可以在 `template.yaml` 中配置您的登录名和密码。

## 部署方式

您可以直接在 serverless devs gui 界面中点击快速部署，部署您的应用
您也可以使用 `@serverless-devs/s` 命令行工具，通过 `s init alinode-faas-insight` 来初始化您的应用，再在项目目录下通过 `s deploy` 部署您的应用（部署前请参照 `template.yaml` 中的示例值自行填写您要部署到的 service，并且根据您的需要修改 function name 和 登录配置 LoginConfig）

## 功能概述

### 指标监控

![指标监控](https://img.alicdn.com/imgextra/i3/O1CN01qSyNF723JDoMVu9dL_!!6000000007234-2-tps-1742-1327.png)

在首页，将会展示 qps、rt、错误率的趋势，以及 nodejs 堆信息等信息，对于趋势图，默认的采样间隔是 60s 即一分钟；为保证查询性能及数据曲线的美观性，当您查看更长时间范围的指标数据时，默认的采样间隔会相应的变长，3 小时以内时间返回内的采样间隔为 60s；3 小时到 6 小时范围的采样间隔为 600s；6 小时到 12 小时范围的采样间隔为 900s；12 小时到 24 小时范围的采样间隔为 1800s；24 小时到 48 小时范围的采样间隔为 3600s 即一小时。

### 链路分析

![链路总览](https://img.alicdn.com/imgextra/i2/O1CN011IgJ0d1GUIDJmLqm4_!!6000000000625-2-tps-1736-1038.png)
![链路跟踪](https://img.alicdn.com/imgextra/i3/O1CN01fMrEjW1ZlDYDDQ89u_!!6000000003234-2-tps-1743-1170.png)

链路分析分为`链路总览`和`链路跟踪`两部分
其中，链路总览列出了调用的下游链路的拓补图（目前只能采集到下游 http 调用），同时展示了不同下游 qps、rt、错误率趋势的对比。
链路跟踪部分，列出了具体调用链路的情况，包括具体的请求快照信息。

### 异常分析

![异常分析](https://img.alicdn.com/imgextra/i4/O1CN01gxvBgd1f1JY3OYblT_!!6000000003946-2-tps-1742-1325.png)

异常分析中，捕获了您代码中 `console.error` 的调用，以及尝试捕获了 `throw Error` 的情况（可能导致进程退出而无法获取上报信息）。您在异常分析中可以查看错误信息以及堆栈信息。

### 诊断

![诊断报告](https://img.alicdn.com/imgextra/i4/O1CN01FzD5E92A9KZI5QnKe_!!6000000008160-2-tps-1741-1167.png)

在 调试/诊断 中，提供了诊断报告分析的能力，在您的 `alinode-runtime-http` 函数中，一旦由于未捕获的异常导致进程退出，我们将会生成一份诊断报告上传的 oss 中，并且在此页面为您呈现。
调试功能目前还在开发中，后续将提供在线远程调试的功能，敬请期待。
