// 全局变量
var data = undefined; // boss和homework数据
var activeBoss = { id: "", idx: "", name: "" }; // 选中的boss，TODO: 没有随着阶段的切换而改变
var stage = undefined; // 预留
var icons = undefined; // 角色列表 [{iconId: "", id: "", iconFilePath: "", iconValue: ""}]
var iconMap = {}; // {id: {name: "", img: ""}}
var iconBossMap = {}; // id: {name: "", img: ""}}
// tab 筛选项
function tabFilter(event, id) {
    let tabcontents = document.getElementsByClassName("battle-tab-content");
    for (let i = 0; i < tabcontents.length; i++) {
        if (i === id) {
            tabcontents[i].style.display = "block";
        } else {
            tabcontents[i].style.display = "none";
        }
    }
    let tabpanels = document.getElementsByClassName("battle-tab-panel");
    for (let i = 0; i < tabpanels.length; i++) {
        tabpanels[i].className = tabpanels[i].className.replace(" active", "");
        if (i === id) {
            tabpanels[i].className += " active";
        }
    }
    // 改变boss信息
    let html = "";
    data.filter((boss) => {
        // 前者从1开始，后者从0开始
        return boss.stage == id + 1;
    }).forEach((boss) => {
        html += getBossHtml(boss);
    });
    document.getElementsByClassName("bosses")[0].innerHTML = html;
    localStorage.setItem("stage", id + 1);
}

// 尾刀和AUTO两个筛选项控制器
function remainderAutoFilter() {
    // 四种情况
    // remainder auto
    //     0      0     只显示非尾刀非auto
    //     0      1     只显示非尾刀auto/半auto
    //     1      0     只显示尾刀非auto
    //     1      1     只显示尾刀auto/半auto
    let is_remainder = document.getElementById("checkbox-remainder").checked;
    let is_auto = document.getElementById("checkbox-auto").checked;
    let hw = document.getElementsByClassName("homework");
    for (let i = 0; i < hw.length; i++) {
        if (!is_remainder && !is_auto) {
            if (hw[i].dataset.paramRemain === "0" && hw[i].dataset.paramAuto === "2") {
                hw[i].style.display = "block";
            } else {
                hw[i].style.display = "none";
            }
        } else if (!is_remainder && is_auto) {
            if (hw[i].dataset.paramRemain === "0" && hw[i].dataset.paramAuto !== "2") {
                hw[i].style.display = "block";
            } else {
                hw[i].style.display = "none";
            }
        } else if (is_remainder && !is_auto) {
            if (hw[i].dataset.paramRemain !== "0" && hw[i].dataset.paramAuto === "2") {
                hw[i].style.display = "block";
            } else {
                hw[i].style.display = "none";
            }
        } else {
            if (hw[i].dataset.paramRemain !== "0" && hw[i].dataset.paramAuto !== "2") {
                hw[i].style.display = "block";
            } else {
                hw[i].style.display = "none";
            }
        }
    }
    localStorage.setItem("remainder", is_remainder);
    localStorage.setItem("auto", is_auto);
}

// 显隐视频
function simpleShowFilter() {
    let is_simple = document.getElementById("checkbox-simple").checked;
    if (is_simple) {
        $(".homework-down").each((_, videos) => {
            videos.style.display = "none";
        });
        $(".homework-wrap").each((_, wrap) => {
            wrap.style.padding = "0 10px";
        });
    } else {
        $(".homework-down").each((_, videos) => {
            videos.style.display = "block";
        });
        $(".homework-wrap").each((_, wrap) => {
            wrap.style.padding = "10px";
        });
    }
    localStorage.setItem("simple", is_simple);
}

// 显示一个Boss信息
function getBossHtml(boss) {
    let html = '<div class="boss-wrap';
    iconBossMap[boss.id].name == activeBoss.name && (html += " active");
    // 通过paramName保证切换阶段时不切换boss
    html += '" id="' + boss.id + '" data-param-name="' + iconBossMap[boss.id].name + '" onclick="changeBoss(event, this.dataset.paramName)">';
    // html += '<div class="boss-profile">';
    html += '<img src="' + iconBossMap[boss.id].img + '" height="48px" width="48px" />';
    /* 
    html += '<div class="boss-name-rate">';
    // html += '<div class="boss-name">' + boss.name + "</div>";
    // html += '<div class="boss-rate">点数比率：' + boss.rate + "</div>";
    html += "</div></div>"; 
    html += '<input class="boss-detail-check" id="boss-detail-check-' + boss.id + '" type="checkbox" onclick="stopClick(event)" />';
    html += '<div class="boss-info boss-detail">' + boss.info;
    boss.detail.forEach(function (detail) {
        html += '<div class="boss-detail-value"><span>' + detail[0] + "</span><span>" + detail[1] + "</span></div>";
    });
    boss.part &&
        boss.part.length > 0 &&
        boss.part.forEach(function (part) {
            html += "<p>" + part.name + "</p>";
            part.detail.forEach(function (detail) {
                html += '<div class="boss-detail-value"><span>' + detail[0] + "</span><span>" + detail[1] + "</span></div>";
            });
        });
    html += "</div>";
    // TODO
    // html += '<label for="boss-detail-check-' + boss.id + '" class="boss-detail-check-down"><img src="' + _qiniuUrl + '/image/gzlj/down-arrow.png" height="20px" /></label>';
    // html += '<label for="boss-detail-check-' + boss.id + '" class="boss-detail-check-up"><img src="' + _qiniuUrl + '/image/gzlj/up-arrow.png" height="20px" /></label>';
    html += '<label for="boss-detail-check-' + boss.id + '" class="boss-detail-check-down"><img class="img-arrow" src="static/icon/down-arrow.png" height="20px" /></label>';
    html += '<label for="boss-detail-check-' + boss.id + '" class="boss-detail-check-up"><img class="img-arrow" src="static/icon/up-arrow.png" height="20px" /></label>';
    */
    html += "</div>";
    return html;
}

function stopClick(e) {
    // 阻止事件冒泡
    e.stopPropagation();
}

// 切换boss，展示该boss下的阵容和欢乐秀，并筛选尾刀和AUTO
function changeBoss(e, activeName, forceUpdate = false) {
    // 点击的是折叠栏
    if (e && (e.target.className === "boss-detail-check-down" || e.target.className === "boss-detail-check-up" || e.target.className === "img-arrow")) {
        return;
    }
    // 没变，不更新
    if (!forceUpdate && activeBoss.name === activeName) {
        return;
    }
    activeBoss.name = activeName;
    let bosses = document.getElementsByClassName("boss-wrap");
    for (let i = 0; i < bosses.length; i++) {
        bosses[i].className = bosses[i].className.replace(" active", "");
        if (bosses[i].dataset.paramName === activeName) {
            bosses[i].className += " active";
            activeBoss.id = bosses[i].id;
            activeBoss.idx = i;
        }
    }

    data.filter(function (boss) {
        return iconBossMap[boss.id].name === activeName;
    }).forEach(function (boss) {
        let html = getHomeworkHtml(boss.homework, boss.joyshow);
        document.getElementById("stage" + boss.stage).innerHTML = html;
    });
    remainderAutoFilter();
    simpleShowFilter();
    localStorage.setItem("boss", activeName);
    // 懒加载重新绑定
    lazyInit();
}

function fiveUnits(units) {
    let html = '<div class="units">';
    units.forEach(function (unit) {
        html += '<div class="unit"><img src="' + iconMap[unit].img + '" /><br>' + iconMap[unit].name + "</div>";
    });
    html += "</div>";
    return html;
}

function listVideos(videos, hwId) {
    let html = '<div class="videos"><span>视频</span>';
    videos.forEach(function (video) {
        html += '<a class="video" href="' + video.url + '" target="_blank">' + video.text + "</a>";
    });
    html += '<div class="video-add" data-param-hwid="' + hwId + '" onclick="addVideo(this.dataset.paramHwid)">＋ 添加我的视频</div>';
    html += "</div>";
    return html;
}

function getHomeworkHtml(homework, joyshow) {
    let html = '<div class="homeworks">';
    if (homework && homework.length !== 0) {
        homework.forEach(function (hw) {
            html +=
                '<div class="homework-wrap homework" data-param-name1="' +
                (hw.unit.length >= 5 ? iconMap[hw.unit[4]].name : "") +
                '" data-param-name2="' +
                (hw.unit.length >= 4 ? iconMap[hw.unit[3]].name : "") +
                '" data-param-name3="' +
                (hw.unit.length >= 3 ? iconMap[hw.unit[2]].name : "") +
                '" data-param-name4="' +
                (hw.unit.length >= 2 ? iconMap[hw.unit[1]].name : "") +
                '" data-param-name5="' +
                (hw.unit.length >= 1 ? iconMap[hw.unit[0]].name : "") +
                '" data-param-auto="' +
                hw.auto +
                '" data-param-damage="' +
                hw.damage +
                '" data-param-remain="' +
                hw.remain +
                '" data-param-sn="' +
                hw.sn +
                '">';
            html += '<div class="homework-up">';
            html += '<label for="batch-check-' + hw.id + '" class="batch-check-label">' + hw.sn + "</label>";
            html += fiveUnits(hw.unit);
            html += '<div class="damage-value">' + hw.damage + "w</div>";
            html += '<div class="homework-info">' + hw.info + "</div>";
            html += "</div>";
            html += '<div class="homework-down">';
            html += listVideos(hw.video, hw.id);
            html += "</div>";
            html += "</div>";
        });
    }
    html += '<div class="homework-wrap homework-add" onclick="addHomework()">+ 添加我的阵容</div>';
    html += "</div>";
    html += '<div class="joyshow">';
    let left = '<div class="joy-left">';
    let right = '<div class="joy-right">';
    let leftHeight = 0;
    let rightHeight = 0;
    if (joyshow && joyshow.length !== 0) {
        let len = joyshow.length;
        for (let i = 0; i < len; i++) {
            let joy = joyshow[i];
            let heightImg = joy.width ? (joy.height * 178) / joy.width : 0;
            let heightMsg = joy.msg ? Math.ceil(joy.msg.length / 14) * 17 : 0;
            let height = heightImg + heightMsg + 22;
            if (leftHeight <= rightHeight) {
                leftHeight += height;
                left += '<div class="joy">';
                if (joy.img) {
                    left += '<img class="img-lazy" src="./static/icon/加载中.gif" alt="' + joy.img + '" onclick="showImg(this.src)"/>';
                }
                if (joy.msg) {
                    left += joy.msg;
                }
                left += "</div>";
            } else {
                rightHeight += height;
                right += '<div class="joy">';
                if (joy.img) {
                    right += '<img class="img-lazy" src="./static/icon/加载中.gif" alt="' + joy.img + '" onclick="showImg(this.src)"/>';
                }
                if (joy.msg) {
                    right += joy.msg;
                }
                right += "</div>";
            }
        }
    }
    leftHeight <= rightHeight ? (left += '<div class="joy joy-add" onclick="addJoy()">+ 吐个槽</div>') : (right += '<div class="joy joy-add" onclick="addJoy()">+ 吐个槽</div>');
    html += left + "</div>" + right + "</div>";
    html += "</div>";
    return html;
}

function sortByGroup(array, f) {
    let groups = {};
    array.forEach((o) => {
        let group = JSON.stringify(f(o));
        groups[group] = groups[group] || { sortKey: undefined, data: [] };
        groups[group].data.push(o);
        if (groups[group].sortKey === undefined || o.damage > groups[group].sortKey) {
            groups[group].sortKey = o.damage;
        }
    });
    return Object.values(groups)
        .sort((a, b) => (a.sortKey < b.sortKey ? -1 : 1))
        .map((value) => {
            return value.data;
        });
}

function sortHomeworkByUnit(that) {
    let asc = that.dataset.paramAsc || "0";
    that.dataset.paramAsc = asc === "0" ? "1" : "0";
    // 阶段1~5都会排序
    $(".homeworks").each((idx, homeworks) => {
        let len = homeworks.children.length - 1;
        let hws = [];
        let hwsText = [];
        for (let i = 0; i < len; i++) {
            hws.push({
                text: i,
                name1: homeworks.children[i].dataset.paramName1,
                name2: homeworks.children[i].dataset.paramName2,
                name3: homeworks.children[i].dataset.paramName3,
                name4: homeworks.children[i].dataset.paramName4,
                name5: homeworks.children[i].dataset.paramName5,
                damage: parseInt(homeworks.children[i].dataset.paramDamage)
            });
            hwsText.push(homeworks.children[i].outerHTML);
        }
        let sorted = sortByGroup(hws, function (hw) {
            return hw.name1;
        })
            .map((hws1) => {
                return sortByGroup(hws1, function (hw) {
                    return hw.name2;
                })
                    .map((hws2) => {
                        return sortByGroup(hws2, function (hw) {
                            return hw.name3;
                        })
                            .map((hws3) => {
                                return sortByGroup(hws3, function (hw) {
                                    return hw.name4;
                                })
                                    .map((hws4) => {
                                        return hws4.sort((a, b) => {
                                            return a.damage < b.damage ? -1 : 1;
                                        });
                                    })
                                    .reduce((prev, curr) => {
                                        return prev.concat(curr);
                                    }, []);
                            })
                            .reduce((prev, curr) => {
                                return prev.concat(curr);
                            }, []);
                    })
                    .reduce((prev, curr) => {
                        return prev.concat(curr);
                    }, []);
            })
            .reduce((prev, curr) => {
                return prev.concat(curr);
            }, []);
        if (asc === "0") {
            sorted = sorted.reverse();
        }
        sorted.forEach((hw, idx) => {
            homeworks.children[idx].outerHTML = hwsText[hw.text];
        });
    });
}

function sortHomeworkBySn(that) {
    let asc = that.dataset.paramAsc || "0";
    that.dataset.paramAsc = asc === "0" ? "1" : "0";
    // 阶段1~5都会排序
    $(".homeworks").each((idx, homeworks) => {
        let len = homeworks.children.length - 1;
        let hws = [];
        let hwsText = [];
        for (let i = 0; i < len; i++) {
            hws.push({
                text: i,
                sn: homeworks.children[i].dataset.paramSn
            });
            hwsText.push(homeworks.children[i].outerHTML);
        }
        hws = hws.sort((a, b) => (a.sn > b.sn ? -1 : 1));
        if (asc === "0") {
            hws = hws.reverse();
        }
        hws.forEach((hw, idx) => {
            homeworks.children[idx].outerHTML = hwsText[hw.text];
        });
    });
}

function sortHomework(that) {
    let asc = that.dataset.paramAsc || "0";
    that.dataset.paramAsc = asc === "0" ? "1" : "0";
    // 阶段1~5都会排序
    $(".homeworks").each((idx, homeworks) => {
        let len = homeworks.children.length - 1;
        let hws = [];
        for (let i = 0; i < len; i++) {
            hws.push({
                text: homeworks.children[i].outerHTML,
                damage: parseInt(homeworks.children[i].dataset.paramDamage)
            });
        }
        hws.sort((a, b) => {
            return asc === "0" ? b.damage - a.damage : a.damage - b.damage;
        }).forEach((hw, idx) => {
            homeworks.children[idx].outerHTML = hw.text;
        });
    });
}

// 阻止页面滚动
function stopMove() {
    let top = -$("body").scrollTop();
    let left = -$("body").scrollLeft();
    $("body").css({
        position: "fixed"
    });
    setTimeout(function () {
        $("body").css({
            top: top + "px",
            left: left + "px"
        });
    });
}

function closeWindow(id) {
    document.getElementsByClassName(id)[0].style.display = "none";
    // 重新滚动
    let top = parseInt(-$("body").css("top").replace("px", ""));
    let left = parseInt(-$("body").css("left").replace("px", ""));
    $("body").css({
        position: "relative",
        top: "0",
        left: "0"
    });
    $("body").scrollTop(top);
    $("body").scrollLeft(left);
}

// 关闭弹窗
function closeShadow(e, that) {
    if (e.target.className.indexOf("window-shadow") != -1) {
        closeWindow(that.className);
    }
}
function closeImgShadow(e, that) {
    if (e.target.className.indexOf("window-shadow") != -1 || e.target.className.indexOf("close") != -1) {
        closeWindow(that.className);
        $("#imgContent")[0].remove();
    }
}

// 确认添加阵容
function confirmHomework() {
    // 用于提交的表单数据，数值都是string
    let form = {
        unit: [],
        bossId: activeBoss.id,
        stage: document.getElementById("select-stage").value,
        remain: "0",
        damage: document.getElementById("input-damage").value,
        auto: document.getElementById("select-auto").value,
        info: document.getElementById("input-info").value,
        video: {
            text: document.getElementById("input-video-title").value,
            url: document.getElementById("input-video-link").value
        }
    };
    if (form.damage === "") {
        // 必须输入参考伤害
        layer.msg("请输入参考伤害", { icon: 0 });
        return;
    }
    let units = document.getElementsByClassName("select-unit");
    for (let i = 0; i < units.length; i++) {
        let unit = units[i].dataset.paramId;
        if (unit === "" || form.unit.indexOf(unit) != -1) {
            // 必须选5个不同的角色
            layer.msg("请选择5个不同的角色", { icon: 0 });
            return;
        }
        form.unit.push(unit);
    }
    document.getElementsByName("input-remainder").forEach((e) => {
        if (e.checked) {
            form.remain = e.value;
        }
    });
    // TODO
    // var _layerIndex = layer.msg("正在提交数据", { icon: 16, time: 0, shade: [0.5, "#000", true] });
    // $.post(_baseUrl + "/gzlj/data/lineup", { data: JSON.stringify(form) }, function (result) {
    //     layer.close(_layerIndex);
    //     if (result.status != 1) {
    //         layer.msg(result.info, { icon: 2 });
    //     } else {
    //         closeWindow("window-add-homework-wrap");
    //         layer.msg("阵容提交成功~请等待审核", { icon: 1 });
    //     }
    // });
    console.log(form);
    closeWindow("window-add-homework-wrap");
}
// 更新选中的角色
function updateSelectedUnits() {
    $(".select-unit-img").each((idx, unit) => {
        unit.innerHTML = "";
    });
    $(".select-unit").each((idx, unit) => {
        unit.value = "";
    });
    let units = $(".unit-icon.active");
    units
        .sort((a, b) => {
            return b.dataset.paramIdx - a.dataset.paramIdx;
        })
        .each((idx, unit) => {
            $("#select-unit-" + idx + "-img")[0].innerHTML = unit.innerHTML;
            $("#select-unit-" + idx)[0].value = unit.dataset.paramName;
            $("#select-unit-" + idx)[0].dataset.paramId = unit.dataset.paramId;
        });
}
// 处理输入的伤害值
function keyDownLoop(e, that) {
    let min = parseInt(that.min);
    let max = parseInt(that.max);
    let value = parseInt(that.value || "0");
    let step = parseInt(that.step);
    if (e.keyCode === 38) {
        // arrow-up
        if (value + step > max) {
            that.value = min - 1;
        }
    } else if (e.keyCode === 40) {
        // arrow-down
        if (value - step < min) {
            that.value = max + 1;
        }
    }
}
// 设置伤害值上限
function maxDamage(stage) {
    data.filter((boss) => {
        return boss.stage == stage;
    })
        .filter((boss, idx) => {
            return idx == activeBoss.idx % 5;
        })
        .forEach((boss) => {
            boss.detail
                .filter((detail) => {
                    return detail[0] === "生命值";
                })
                .forEach((detail) => {
                    $("#input-damage")[0].max = detail[1] / 10000;
                });
        });
}
// 显示添加阵容弹窗
function addHomework() {
    $(".window-add-homework-wrap")[0].style.display = "block";
    stopMove();

    // 获取icons不再放在这里
    for (let _idx = 0; _idx < 3; _idx++) {
        let _icon = icons[_idx];
        let html = "";
        _icon.forEach((icon, idx) => {
            html +=
                '<div class="unit-icon" title="' +
                icon.iconValue +
                '" data-param-id="' +
                icon.iconId +
                '" data-param-name="' +
                icon.iconValue +
                '" data-param-idx="' +
                (_idx * 1000 + idx) +
                '"><img src="' +
                icon.iconFilePath +
                '"></div>';
        });
        $("#candidate-unit-wrap-" + _idx)[0].innerHTML = html;
    }
    $(".unit-icon").click(function () {
        if (this.className.indexOf(" active") === -1) {
            // 选中
            if ($(".unit-icon.active").length >= 5) {
                // 最多5个
                return;
            }
            this.className += " active";
        } else {
            // 取消
            this.className = this.className.replace(" active", "");
        }
        updateSelectedUnits();
    });
    $(".select-unit-imgs").click(function () {
        let id = this.children[1].dataset.paramId;
        $(".unit-icon")
            .filter(function () {
                return this.dataset.paramId == id;
            })
            .each(function () {
                this.className = this.className.replace(" active", "");
            });
        updateSelectedUnits();
    });
    // 读取值，填充选项
    // boss头像&id
    data.filter((boss) => {
        return boss.id == activeBoss.id;
    }).forEach((boss) => {
        $("#select-boss-span")[0].innerHTML = '<img src="' + iconBossMap[boss.id].img + '" />';
    });
    // 整刀 / 尾刀
    let is_remainder = $("#checkbox-remainder")[0].checked;
    if (is_remainder) {
        $("#input-remainder-1")[0].checked = true;
    } else {
        $("#input-remainder-0")[0].checked = true;
    }
    // 阶段
    let stages = $(".battle-tab-panel");
    let options = $("#select-stage")[0].options;
    let selectedStage = "1";
    for (let i = 0; i < stages.length; i++) {
        if (stages[i].className.indexOf("active") !== -1) {
            selectedStage = stages[i].value;
            break;
        }
    }
    for (let i = 0; i < options.length; i++) {
        if (options[i].value == selectedStage) {
            options[i].selected = true;
            break;
        }
    }
    // 手动 / AUTO
    let is_auto = $("#checkbox-auto")[0].checked;
    options = $("#select-auto")[0].options;
    for (let i = 0; i < options.length; i++) {
        if ((is_auto && options[i].value == "1") || (!is_auto && options[i].value == "2")) {
            options[i].selected = true;
            break;
        }
    }
    // 参考伤害上限
    maxDamage(selectedStage);
}

// 确认添加视频
function confirmVideo() {
    let form = {
        hwId: document.getElementsByClassName("window-add-video-wrap")[0].dataset.paramHwid,
        text: document.getElementById("input-add-video-title").value,
        url: document.getElementById("input-add-video-link").value
    };
    if (form.text === "" || form.url === "") {
        // 简单判空处理
        return;
    }
    // TODO
    // var _layerIndex = layer.msg("正在提交数据", { icon: 16, time: 0, shade: [0.5, "#000", true] });
    // $.post(_baseUrl + "/gzlj/data/video", { data: JSON.stringify(form) }, function (result) {
    //     layer.close(_layerIndex);
    //     if (result.status != 1) {
    //         layer.msg(result.info, { icon: 2 });
    //     } else {
    //         closeWindow("window-add-video-wrap");
    //         layer.msg("阵容视频提交成功~请等待审核", { icon: 1 });
    //     }
    // });
    console.log(form);
    closeWindow("window-add-video-wrap");
}

// 显示添加视频
function addVideo(hwId) {
    // hwId为作业id，隐性参数
    $(".window-add-video-wrap")[0].style.display = "block";
    $(".window-add-video-wrap")[0].dataset.paramHwid = hwId;
    stopMove();
}

// 确认添加吐槽
function confirmJoy() {
    let form = {
        bossId: activeBoss.id,
        text: document.getElementById("input-add-joy-text").value,
        img: ""
    };
    let file = document.getElementById("input-add-joy-img").files[0];
    if (file !== undefined) {
        if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/gif") {
            layer.msg("不是有效的图片文件!", { icon: 0 });
            return;
        }
        var fileReader = new FileReader();
        fileReader.onload = function (e) {
            // TODO
            form.img = e.target.result;
            // var _layerIndex = layer.msg("正在提交数据", { icon: 16, time: 0, shade: [0.5, "#000", true] });
            // $.post(_baseUrl + "/gzlj/data/debunk", { data: JSON.stringify(form) }, function (result) {
            //     layer.close(_layerIndex);
            //     if (result.status != 1) {
            //         layer.msg(result.info, { icon: 2 });
            //     } else {
            //         closeWindow("window-add-joy-wrap");
            //         // 关闭窗口同时清除数据，只有这里是必要的，吐槽内容不太可能相近
            //         document.getElementById("input-add-joy-text").value = "";
            //         document.getElementById("input-add-joy-img").value = "";
            //         layer.msg("吐槽提交成功~请等待审核", { icon: 1 });
            //     }
            // });
            layer.msg("吐槽提交成功~请等待审核", { icon: 1 });
            closeWindow("window-add-joy-wrap");
            // 关闭窗口同时清除数据，只有这里是必要的，吐槽内容不太可能相近
            document.getElementById("input-add-joy-text").value = "";
            document.getElementById("input-add-joy-img").value = "";
        };
        fileReader.readAsDataURL(file);
    } else if (form.text !== "") {
        // TODO
        // var _layerIndex = layer.msg("正在提交数据", { icon: 16, time: 0, shade: [0.5, "#000", true] });
        // $.post(_baseUrl + "/gzlj/data/debunk", { data: JSON.stringify(form) }, function (result) {
        //     layer.close(_layerIndex);
        //     if (result.status != 1) {
        //         layer.msg(result.info, { icon: 2 });
        //     } else {
        //         closeWindow("window-add-joy-wrap");
        //         document.getElementById("input-add-joy-text").value = "";
        //         layer.msg("吐槽提交成功~请等待审核", { icon: 1 });
        //     }
        // });
        layer.msg("吐槽提交成功~请等待审核", { icon: 1 });
        closeWindow("window-add-joy-wrap");
        document.getElementById("input-add-joy-text").value = "";
    }
}

// 显示吐个槽
function addJoy() {
    $(".window-add-joy-wrap")[0].style.display = "block";
    stopMove();
}

// 点击显示图片大图
function showImg(src) {
    $(".window-img-wrap")[0].style.display = "block";
    stopMove();
    var imgContent = document.createElement("img");
    imgContent.setAttribute("src", src.replace("/cache/", "/attachment/"));
    imgContent.setAttribute("id", "imgContent");
    imgContent.setAttribute("class", "handleimg-box");

    $(".window-img-wrap")[0].appendChild(imgContent);

    let oipc = $("#imgContent")[0];
    let isDrag = false; //是否开始拖拽 false 不拖拽
    let disX, disY; //图片相对于图片的位置
    //鼠标按下时
    $("#imgContent").on("mousedown", function (e) {
        isDrag = true;
        this.style.cursor = "move";
        e = e || window.event; //兼容性写法
        //鼠标位置
        let x = e.clientX;
        let y = e.clientY;
        //鼠标相对于图片的位置
        disX = x - this.offsetLeft;
        disY = y - this.offsetTop;
    });

    // 鼠标移动时
    $("#imgContent").on("mousemove", function (e) {
        if (!isDrag) {
            return;
        }
        e = e || window.event; //兼容性写法
        //鼠标位置
        let x = e.clientX;
        let y = e.clientY;
        //修改图片位置
        oipc.style.left = x - disX + "px";
        oipc.style.top = y - disY + "px";
    });

    // 鼠标抬起时
    $("#imgContent").on("mouseup", function (e) {
        isDrag = false;
        oipc.style.cursor = "grab";
    });

    // 滚轮
    $("#imgContent").on("mousewheel", function (e) {
        e = e || window.event; //兼容性写法
        e.delta = e.originalEvent.wheelDelta || e.detail || 0;
        if (e.delta > 0) {
            $("#imgContent")[0].style.height = $("#imgContent")[0].offsetHeight * 1.2 + "px";
        } else if (e.delta < 0) {
            $("#imgContent")[0].style.height = $("#imgContent")[0].offsetHeight / 1.2 + "px";
        }
    });
}
// 放大图片
function expandImg() {
    let imgContent = $("#imgContent")[0];
    if (imgContent) {
        imgContent.style.height = imgContent.offsetHeight * 1.2 + "px";
    }
}
// 缩小图片
function narrowImg() {
    let imgContent = $("#imgContent")[0];
    if (imgContent) {
        imgContent.style.height = imgContent.offsetHeight / 1.2 + "px";
    }
}

// lazy load image
// example: <img src="加载中.gif" class="img-lazy" alt="Chr_110631.jpg" />
function lazyInit() {
    var eles = document.querySelectorAll(".img-lazy"); // 获取所有列表元素
    // 监听回调
    var lazycallback = function (entries) {
        entries.forEach(function (item) {
            // 出现到可视区
            if (item.intersectionRatio > 0) {
                var ele = item.target;
                var imgSrc = ele.getAttribute("alt");
                if (imgSrc) {
                    // 预加载
                    var img = new Image();
                    img.addEventListener(
                        "load",
                        function () {
                            ele.src = imgSrc;
                        },
                        false
                    );
                    ele.src = imgSrc;
                    // 加载过清空路径，避免重复加载
                    ele.removeAttribute("alt");
                }
            }
        });
    };
    var observer = new IntersectionObserver(lazycallback);

    // 列表元素加入监听
    eles.forEach(function (item) {
        observer.observe(item);
    });
}

function initIconMap() {
    // 初始化头像图片、名字的map，根据id查找
    for (let i = 0; i < 3; i++) {
        icons[i].forEach((icon) => {
            iconMap[icon.id] = { name: icon.iconValue, img: icon.iconFilePath };
        });
    }
    icons[3].forEach((icon) => {
        iconBossMap[icon.id] = { name: icon.iconValue, img: icon.iconFilePath };
    });
}

// 选择历史档案
function selectHistory(date) {
    getData(date);
}

// date example: "2022-03"
function getData(date = "") {
    let bossname = localStorage.getItem("boss") || "";
    $.get("static/test/icons.json", { date: date }, function (_data, status) {
        icons = _data;
        initIconMap();
        $.get("static/test/demo.json", { date: date }, function (_data, status) {
            data = _data;
            // activeBoss = {id: data[0].id, idx: 0, name: data[0].name}
            let found = false; // 上次记录的boss是否能在这次数据里找到
            let html = "";
            data.filter((boss) => {
                // 兼容 stage="1"，以防万一
                return boss.stage == stage;
            }).forEach((boss) => {
                if (iconBossMap[boss.id].name === bossname) {
                    found = true;
                }
                html += getBossHtml(boss);
            });
            document.getElementsByClassName("bosses")[0].innerHTML = html;

            tabFilter(null, stage - 1);
            !found && (bossname = iconBossMap[data[0].id].name);
            changeBoss(null, bossname, true);
            // 懒加载图片
            lazyInit();
        });
    });
}

function init() {
    // 读取上次显示的设置
    stage = localStorage.getItem("stage") || 1;
    $("#checkbox-remainder")[0].checked = localStorage.getItem("remainder") === "true";
    $("#checkbox-auto")[0].checked = localStorage.getItem("auto") === "true";
    $("#checkbox-simple")[0].checked = localStorage.getItem("simple") === "true";
    getData();
    // 轮播图
    new Swiper(".swiper", {
        loop: true,
        pagination: {
            el: ".swiper-pagination"
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },
        autoHeight: true,
        autoplay: {
            delay: 5000,
            stopOnLastSlide: false,
            disableOnInteraction: true
        }
    });
}

$(document).ready(function () {
    init();
});
