# 中眠网上线前最终检查清单

## 1. 前台公开链路

- [ ] 首页可正常打开
- [ ] `/knowledge` 可正常打开
- [ ] `/terms` 可正常打开
- [ ] `/brands` 可正常打开
- [ ] 三类详情页至少各抽查 2 条
- [ ] 中文 slug 详情页可正常访问
- [ ] 未发布内容访问仍为 404

## 2. 后台访问控制

- [ ] `/admin/login` 可正常打开
- [ ] 使用后台账号密码可登录
- [ ] `/admin`、`/admin/content`、`/admin/terms`、`/admin/brands`、`/admin/ai-editorial` 可访问
- [ ] 点击“退出后台”后会跳回 `/admin/login?notice=logged-out`
- [ ] 未登录访问后台会被拦截并跳转到登录页

## 3. 内容生产与发布

- [ ] Content 可新建、保存、提审、发布、下线
- [ ] Term 可新建、保存、提审、发布、下线
- [ ] Brand 可新建、保存、提审、发布、下线
- [ ] 批量提审可用
- [ ] 批量发布可用
- [ ] 批量下线可用
- [ ] 前台只显示 `PUBLISHED`

## 4. AI 编辑部

- [ ] 可新建 AiTask
- [ ] 可选择模板
- [ ] 可显示 provider 信息
- [ ] 可执行模拟生成
- [ ] 可挂接 Content 草稿
- [ ] AI 草稿不会误暴露到前台

## 5. 编辑体验

- [ ] Content 正文支持 Word / WPS 粘贴
- [ ] Term 标准定义 / 详细解释支持 Word / WPS 粘贴
- [ ] Brand 详细介绍支持 Word / WPS 粘贴
- [ ] 粘贴后能保留标题、段落、列表、加粗、斜体
- [ ] 前台详情页结构化内容显示正常

## 6. 数据与发布安全

- [ ] `DATABASE_URL` 已配置
- [ ] Prisma 数据库连接正常
- [ ] 线上要发布的内容状态已核对
- [ ] 明显测试残留未处于 `PUBLISHED`
- [ ] 可疑测试稿已处理为 `DRAFT` 或 `OFFLINE`

## 7. SEO / 基础可见性

- [ ] metadata 正常输出
- [ ] sitemap 可访问
- [ ] 页面 title / description 结构正常
- [ ] 列表页与详情页 URL 稳定

## 8. 部署前最后动作

- [ ] `npm run typecheck` 通过
- [ ] `npm run lint` 通过
- [ ] `npm run build` 通过
- [ ] `.env` 与敏感配置未提交
- [ ] 部署环境后台账号、密码、session secret 已配置

## 9. 部署后第一轮冒烟

- [ ] 重新打开首页
- [ ] 抽查三类列表页
- [ ] 抽查三类详情页
- [ ] 后台登录一次
- [ ] 新建一条草稿并保存
- [ ] 下线一条测试条目并确认前台不可见
