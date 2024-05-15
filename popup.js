// 搜索功能
var searchInput = document.getElementById('search-input');
let searchTimeout;

searchInput.addEventListener('input', function (event) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchTabs, 300);
});

async function loadList(filter) {
    let windows = await chrome.windows.getAll({ populate: true })
    var tabsList = document.getElementById('tabs-list');
    tabsList.innerHTML = '';

    for (let win of windows) {
        var winDiv = document.createElement('div');
        winDiv.className = 'window';
        var winTitle = document.createElement('h3');
        winTitle.textContent = win.title;
        winDiv.appendChild(winTitle);
        var winTabs = document.createElement('ul');

        const headerText = document.createElement('h2');
        headerText.className = "group_title"
        headerText.textContent = `Window (${win.tabs.length})`;

        winTabs.appendChild(headerText);

        // 按最后访问进行排序
        let tabs = win.tabs
        let tabsTimes = (await chrome.storage.local.get(["tabs_record"])).tabs_record || {}


        // 按最后访问进行排序，lastAccessed 不知道为啥获取不到，手动做一下记录
        tabs.sort(function (a, b) {
            let objA = tabsTimes[a.id]
            let objB = tabsTimes[b.id]

            if (objA == undefined || objB == undefined) {
                return 1
            }

            let aLastAccessed = objA.time
            let bLastAccessed = objB.time

            return bLastAccessed - aLastAccessed;
        });

        for (let tab of tabs) {
            var tabLi = document.createElement('li');

            // 过滤
            if (filter != undefined && filter.length > 0) {
                if (tab.title.toLowerCase().indexOf(filter.toLowerCase()) < 0 &&
                    tab.url.toLowerCase().indexOf(filter.toLowerCase()) < 0) {
                    continue
                }
            }

            const tabDiv = document.createElement('div');
            tabDiv.className = "container"
            // 添加 Tab 图标
            const tabIconUrl = tab.favIconUrl || 'default-favicon.png';
            const tabIcon = document.createElement('img');
            tabIcon.style.height = '20px';
            tabIcon.src = tabIconUrl;
            tabDiv.appendChild(tabIcon);

            // 添加标题和URL
            const contentDiv = document.createElement('div');
            const title = tab.title || "无标题"
            const titleH4 = document.createElement('h4');
            const titleTextNode = document.createTextNode(title);
            titleH4.className = "detail_title"

            titleH4.appendChild(titleTextNode);
            contentDiv.appendChild(titleH4);

            const url = tab.url;
            const urlA = document.createElement('a');
            urlA.className = "detail_url"
            urlA.href = url;
            const urlTextNode = document.createTextNode(url);
            urlA.appendChild(urlTextNode);
            contentDiv.appendChild(urlA);

            tabDiv.appendChild(contentDiv);

            tabLi.dataset.tabid = tab.id;
            tabLi.dataset.windowid = tab.windowId;
            tabLi.addEventListener('click', function (event) {
                event.preventDefault();

                var target = event.currentTarget;

                if (target.dataset.tabid) {
                    chrome.tabs.update(parseInt(target.dataset.tabid), { active: true }, function (tab) {
                        chrome.windows.update(parseInt(target.dataset.windowid), { focused: true })
                    });
                }
            });

            tabLi.appendChild(tabDiv);
            winTabs.appendChild(tabLi);
        }

        winDiv.appendChild(winTabs);
        tabsList.appendChild(winDiv);
    }
}

function searchTabs() {
    var filter = searchInput.value;
    console.log("搜索", filter);
    loadList(filter);
}

loadList();