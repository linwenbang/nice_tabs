
chrome.tabs.onActivated.addListener(async function (activeInfo) {
    if (activeInfo.tabId === chrome.tabs.TAB_ID_NONE) {
        return;
    }

    // 记录当前选项卡的 ID 和访问时间
    var tabId = activeInfo.tabId;
    var currentTime = Date.now();
    // 写入存储

    let records = await readLocalStorage("tabs_record") || {}

    records[`${tabId}`] = {
        id: tabId,
        time: currentTime
    }

    // 清理 records 中关闭的部分
    let allTabs = await chrome.tabs.query({})
    let allTabIds = allTabs.map((e) => e.id)

    for (let tabId in records) {
        if (allTabIds.indexOf(parseInt(tabId)) < 0) {
            delete records[tabId]
        }
    }

    await setLocalStorage("tabs_record", records)
});

async function readLocalStorage(key) {
    try {
        let ret = await chrome.storage.local.get([key])
        return ret[key]
    } catch (e) {
        console.error(e)
    }
}

async function setLocalStorage(key, value) {
    try {
        await chrome.storage.local.set({ [key]: value })
    } catch (e) {
        console.error(e)
    }
}