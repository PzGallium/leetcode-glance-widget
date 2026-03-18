# 力扣中国站「全年」提交日历

未登录时接口只返回最近约 20 条提交，日历只有近期记录。

要显示**全年**提交日历，需要提供登录态（Cookie）。

---

## 登录态会过期吗？怎么尽量“不过期”？

**会过期。** 力扣的 `LEETCODE_SESSION` 由服务器控制，一般几周不用或服务器端刷新就会失效，**没法在本地设置成永不过期**。

可以做的只有**延长可用时间**、**过期后尽快发现**：

1. **多用同一浏览器登录力扣**  
   在电脑上经常用浏览器打开 leetcode.cn 做题/看题，同一浏览器里的 Cookie 会被刷新，你复制到 `.leetcode_cn_session` 的那份也会在下次复制前保持“新鲜”。  
   若你长期不用浏览器上力扣，只靠 widget 用这份 Cookie，服务器可能在一段时间后让这个 session 失效。

2. **过期后重新复制一次**  
   当 widget 里**全年日历突然变空**或**又只剩最近一点**时，多半是登录态过期了。  
   按下面步骤再在浏览器里复制一次 `LEETCODE_SESSION`，覆盖更新 `.leetcode_cn_session` 即可，无需改脚本。

3. **（可选）提醒自己定期更新**  
   在日历里设一个每 2～3 周的提醒：“更新力扣 widget 的 LEETCODE_SESSION”，打开 leetcode.cn 复制一次 Cookie 到 `.leetcode_cn_session`，能减少“突然失效”的感觉。

## 配置登录态（本地文件）

1. 在浏览器打开 https://leetcode.cn 并登录。
2. 按 F12 打开开发者工具 → Application（应用程序）→ Cookies → 选中 leetcode.cn。
3. 找到名为 `LEETCODE_SESSION` 的 Cookie，复制其**值**（一长串字符）。
4. 把LEETCODE_SESSION给widget
    a.在 **widget 根目录**（`leetcode-glance-widget` 文件夹下）新建文件 `.leetcode_cn_session`，把复制的值粘贴进去保存（只放这一串，不要引号、不要多余空格）。  
   b. 也可用一条命令完成：  
   `echo "你复制的LEETCODE_SESSION值" > "$HOME/Library/Application Support/Übersicht/widgets/leetcode-glance-widget/.leetcode_cn_session"`
5. 重新加载 widget。

注意：不要将 `.leetcode_cn_session` 提交到 Git 或分享给他人，里面是登录凭证。
