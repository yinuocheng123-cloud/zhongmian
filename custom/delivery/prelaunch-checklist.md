# 中眠网上线前检查清单

## 一、代码与构建

- [ ] `npm run typecheck` 通过
- [ ] `npm run lint` 通过
- [ ] `npm run build` 通过
- [ ] 当前分支已合并到正式交付分支或 `main`
- [ ] 未提交 `.env`、`DATABASE_URL`、本地敏感配置

## 二、数据库与环境

- [ ] 生产 `DATABASE_URL` 已配置
- [ ] `ADMIN_USERNAME`、`ADMIN_PASSWORD`、`ADMIN_SESSION_SECRET` 已配置
- [ ] 生产数据库已执行 schema 同步
- [ ] seed 数据或首批正式内容已准备完毕
- [ ] 不存在误发布的测试残留内容

## 三、首页与主入口

- [ ] 首页可正常打开
- [ ] 首页一眼能看出“知识入口 + 信任入口 + 商业入口”
- [ ] 七大核心入口都可点击进入
- [ ] 热门问题入口可进入知识栏目
- [ ] 词库精选、知识内容、品牌入口区可正常跳转
- [ ] 信任体系区入口不再是空占位或 404
- [ ] 企业合作入口可正常进入合作页

## 四、主栏目前台检查

- [ ] `/knowledge` 正常
- [ ] `/terms` 正常
- [ ] `/brands` 正常
- [ ] `/trends` 正常
- [ ] `/events` 正常
- [ ] `/brand-progress` 正常
- [ ] `/rankings` 正常
- [ ] `/indexes` 正常
- [ ] `/standards` 正常
- [ ] `/think-tank` 正常
- [ ] `/cooperation` 正常

## 五、详情页检查

- [ ] Content 已发布详情页可访问
- [ ] Term 已发布详情页可访问
- [ ] Brand 已发布详情页可访问
- [ ] 扩展栏目已发布详情页可访问
- [ ] 中文 slug 正常访问
- [ ] 未发布内容仍返回 404 或不在前台列表出现

## 六、后台登录与主流程

- [ ] `/admin/login` 可打开
- [ ] 正式账号密码可登录
- [ ] `/admin` 仪表盘可打开
- [ ] `/admin/content` 可打开并管理
- [ ] `/admin/terms` 可打开并管理
- [ ] `/admin/brands` 可打开并管理
- [ ] `/admin/trends` 可打开并管理
- [ ] `/admin/events` 可打开并管理
- [ ] `/admin/brand-progress` 可打开并管理
- [ ] `/admin/rankings` 可打开并管理
- [ ] `/admin/indexes` 可打开并管理
- [ ] `/admin/standards` 可打开并管理
- [ ] `/admin/think-tank` 可打开并管理

## 七、发布流转

- [ ] 草稿保存正常
- [ ] 提交审核正常
- [ ] 发布正常
- [ ] 下线正常
- [ ] 批量提交审核正常
- [ ] 批量发布正常
- [ ] 批量下线正常
- [ ] 删除仅允许草稿 / 已下线内容
- [ ] 前台只展示 `PUBLISHED`

## 八、AI 编辑部

- [ ] `/admin/ai-editorial` 正常
- [ ] 可创建趋势类任务
- [ ] 可创建智库类任务
- [ ] 可创建标准类任务
- [ ] 可创建榜单 / 指数说明任务
- [ ] 生成结果默认为草稿链路
- [ ] 可挂接 Content 草稿
- [ ] AI 草稿不会误暴露到前台

## 九、SEO / GEO

- [ ] 首页 metadata 正常
- [ ] 新增栏目 metadata 正常
- [ ] 新增详情页 title / description 正常
- [ ] sitemap 已纳入新增 `PUBLISHED` 内容
- [ ] sitemap 不暴露 `DRAFT` / `OFFLINE`
- [ ] URL 使用稳定 slug

## 十、上线后首轮冒烟重点

- [ ] 首页
- [ ] `/knowledge`
- [ ] `/terms`
- [ ] `/brands`
- [ ] `/trends`
- [ ] `/events`
- [ ] `/brand-progress`
- [ ] `/rankings`
- [ ] `/indexes`
- [ ] `/standards`
- [ ] `/think-tank`
- [ ] `/cooperation`
- [ ] `/admin/login`
- [ ] 登录后的后台主入口
