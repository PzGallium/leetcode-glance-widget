const NATIVE_HOST = 'com.pzgallium.leetcode_session_sync';
const ALARM_NAME = 'sync-leetcode-session';
const LEETCODE_URL = 'https://leetcode.cn/';
const SESSION_COOKIE = 'LEETCODE_SESSION';

async function syncSession() {
  const cookie = await chrome.cookies.get({
    url: LEETCODE_URL,
    name: SESSION_COOKIE,
  });
  if (!cookie || !cookie.value) return;

  await chrome.runtime.sendNativeMessage(NATIVE_HOST, {
    session: cookie.value,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 30 });
  void syncSession();
});

chrome.runtime.onStartup.addListener(() => {
  void syncSession();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) void syncSession();
});

chrome.cookies.onChanged.addListener(({ cookie }) => {
  if (
    cookie.name === SESSION_COOKIE
    && cookie.domain.endsWith('leetcode.cn')
  ) {
    void syncSession();
  }
});
