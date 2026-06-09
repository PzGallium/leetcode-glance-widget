# 力扣中国站完整提交日历

未登录时接口只返回最近约 20 条提交，日历只有近期记录。

要完整显示组件中最近 6 个月的提交日历，需要提供登录态（Cookie）。

组件会按力扣中国站的 `Asia/Shanghai` 时区计算提交日期。即使 macOS 位于其他时区，提交也不会被错误归到前一天或后一天。

---

## 推荐：ChatGPT Atlas 自动同步

仓库内置了一个权限受限的 Atlas 扩展。它只读取 `leetcode.cn` 的
`LEETCODE_SESSION`，并通过本机 Native Messaging 写入 widget 的
`.leetcode_cn_session` 文件。

1. 在 widget 根目录执行：

   ```bash
   node lc-scripts/install-atlas-cookie-host.mjs
   ```

2. 在 ChatGPT Atlas 地址栏打开：

   ```text
   chrome://extensions/
   ```

3. 开启 **Developer mode**。
4. 点击 **Load unpacked**，选择 widget 目录下的 `atlas-extension` 文件夹。
5. 保持 Atlas 中的 `leetcode.cn` 登录状态。

扩展会在以下时间自动同步：

- 扩展首次安装时
- Atlas 启动时
- `LEETCODE_SESSION` 发生变化时
- 每 30 分钟

本机 Host manifest 安装在 Atlas 的 `NativeMessagingHosts` 目录中。Session
文件权限为 `600`，并且已被 Git 忽略。

---

## 手动配置

1. 在浏览器打开 https://leetcode.cn 并登录。
2. 打开开发者工具 → **Application** → **Cookies** → `https://leetcode.cn`。
3. 找到 `LEETCODE_SESSION`，复制完整的 **Value**。
4. 在 widget 根目录创建或覆盖 `.leetcode_cn_session`。文件中只放 Session
   值本身，不要添加引号或 `LEETCODE_SESSION=`。
5. 重新加载 widget。

也可以执行：

```bash
printf '%s\n' '你的 LEETCODE_SESSION 值' > .leetcode_cn_session
chmod 600 .leetcode_cn_session
```

---

## 登录态会过期吗？

**会过期。** 力扣的 `LEETCODE_SESSION` 由服务器控制，一般几周不用或服务器端刷新就会失效，**没法在本地设置成永不过期**。

Atlas 自动同步会跟随浏览器中的新 Session 更新本地文件。使用手动配置时，如果日历突然只剩少量近期记录，通常需要重新复制 Session。

脚本会保留已有的历史缓存，并与近期公开提交合并，因此临时认证失败不会立即清空历史日历；但缓存之后缺失的日期仍需要有效 Session 才能补齐。

> 不要提交或分享 `.leetcode_cn_session`。它是登录凭证。
