// 搜索功能
var searchInput = document.getElementById('search-input');
let searchTimeout;

searchInput.addEventListener('input', function (event) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchTabs, 300);
});

async function loadList(filter) {
    let windows = await chrome.windows.getAll({ populate: true })
    let currentWindow = await chrome.windows.getCurrent()
    windows.sort(function (a, b) {
        if (a.id === currentWindow.id) {
            return -1;
        }
        if (b.id === currentWindow.id) {
            return 1;
        }
        return 0;
    });

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

        let hasTab = false
        for (let tab of tabs) {
            var tabLi = document.createElement('li');
            tabLi.className = "cell"

            // 过滤
            if (filter != undefined && filter.length > 0) {
                if (tab.title.toLowerCase().indexOf(filter.toLowerCase()) < 0 &&
                    tab.url.toLowerCase().indexOf(filter.toLowerCase()) < 0) {
                    continue
                }
            }

            hasTab = true

            const leftContainer = document.createElement('div');
            leftContainer.className = "container"
            // 添加 Tab 图标
            const tabIconUrl = tab.favIconUrl || 'default-favicon.png';
            const tabIcon = document.createElement('img');
            tabIcon.style.height = '20px';
            tabIcon.src = tabIconUrl;
            leftContainer.appendChild(tabIcon);

            // 添加标题和URL
            const contentDiv = document.createElement('div');
            contentDiv.className = "url_container"
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
            leftContainer.appendChild(contentDiv);



            // 添加删除按钮
            var deleteButton = document.createElement('button');
            deleteButton.innerHTML = "关闭";
            deleteButton.className = "delete-button";
            deleteButton.addEventListener('click', function (event) {
                event.stopPropagation();
                if (tab.id) {
                    chrome.tabs.remove(tab.id);
                }
                // 刷新列表
                searchTabs();
            });
            tabLi.appendChild(leftContainer);
            tabLi.appendChild(deleteButton);
            

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
            winTabs.appendChild(tabLi);
        }

        if (!hasTab) {
            var tabLi = document.createElement('li');
            tabLi.className = "cell"
            tabLi.innerHTML = "None"
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