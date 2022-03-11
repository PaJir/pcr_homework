// 全局变量
var data = undefined; // boss和homework数据
var activeBoss = { id: "", idx: "", name: "" }; // 选中的boss
var stage = undefined; // 预留
var icons = undefined; // 角色列表 [{iconFilePath: "", iconValue: ""}]
// hover
$(".top-hover").hover(
    function () {
        $(".top-h2").css("max-height", "20px");
    },
    function () {
        $(".top-h2").css("max-height", "0");
    }
);
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
    }
    event.currentTarget.className += " active";
    // 改变boss信息
    let html = "";
    data.filter((boss) => {
        // 前者从1开始，后者从0开始
        return boss.stage == id + 1;
    }).forEach((boss) => {
        html += getBossHtml(boss);
    });
    document.getElementsByClassName("bosses")[0].innerHTML = html;
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
            if (hw[i].dataset.paramRemain === "0" && hw[i].dataset.paramAuto === "0") {
                hw[i].style.display = "block";
            } else {
                hw[i].style.display = "none";
            }
        } else if (!is_remainder && is_auto) {
            if (hw[i].dataset.paramRemain === "0" && hw[i].dataset.paramAuto !== "0") {
                hw[i].style.display = "block";
            } else {
                hw[i].style.display = "none";
            }
        } else if (is_remainder && !is_auto) {
            if (hw[i].dataset.paramRemain !== "0" && hw[i].dataset.paramAuto === "0") {
                hw[i].style.display = "block";
            } else {
                hw[i].style.display = "none";
            }
        } else {
            if (hw[i].dataset.paramRemain !== "0" && hw[i].dataset.paramAuto !== "0") {
                hw[i].style.display = "block";
            } else {
                hw[i].style.display = "none";
            }
        }
    }
}

// 显示一个Boss信息
function getBossHtml(boss) {
    let html = '<div class="boss-wrap';
    boss.name == activeBoss.name && (html += " active");
    // 通过paramName保证切换阶段时不切换boss
    html += '" id="' + boss.id + '" data-param-name="' + boss.name + '" onclick="changeBoss(event, this.dataset.paramName)">';
    html += '<div class="boss-profile">';
    html += '<img src="' + boss.icon + '" height="48px" width="48px" />';
    html += '<div class="boss-name-rate">';
    html += '<div class="boss-name">' + boss.name + "</div>";
    html += '<div class="boss-rate">点数比率：' + boss.rate + "</div>";
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
    html += '<label for="boss-detail-check-' + boss.id + '" class="boss-detail-check-down"><img src="static/icon/down-arrow.png" height="20px" /></label>';
    html += '<label for="boss-detail-check-' + boss.id + '" class="boss-detail-check-up"><img src="static/icon/up-arrow.png" height="20px" /></label>';
    html += "</div>";
    return html;
}

// TODO: iOS上点击的bug
function stopClick(e) {
    // 阻止事件冒泡
    e.stopPropagation();
}

// 切换boss，展示该boss下的阵容和欢乐秀，并筛选尾刀和AUTO
function changeBoss(e, activeName) {
    // 点击的是折叠栏
    if (e && (e.path[1].className === "boss-detail-check-down" || e.path[1].className === "boss-detail-check-up")) {
        return;
    }
    // 没变，不更新
    if (activeBoss.name === activeName) {
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
        return boss.name === activeName;
    }).forEach(function (boss) {
        let html = getHomeworkHtml(boss.homework, boss.joyshow);
        document.getElementById("stage" + boss.stage).innerHTML = html;
    });
    remainderAutoFilter();
}

function fiveUnits(units) {
    let html = '<div class="units">';
    units.forEach(function (unit) {
        html += '<div class="unit"><img src="' + unit.icon + '" /><br>' + unit.name + "</div>";
    });
    html += "</div>";
    return html;
}

function listVideos(videos, hwId) {
    let html = '<div class="videos"><span>视频</span>';
    videos.forEach(function (video) {
        html += '<div class="video"><a href="' + video.url + '" target="_blank">' + video.text + "</a></div>";
    });
    html += '<div class="video-add" data-param-hwid="' + hwId + '" onclick="addVideo(this.dataset.paramHwid)">＋ 添加我的视频</div>';
    html += "</div>";
    return html;
}

function getHomeworkHtml(homework, joyshow) {
    let html = '<div class="homeworks">';
    if (homework && homework.length !== 0) {
        homework.forEach(function (hw) {
            html += '<div class="homework-wrap homework" data-param-auto="' + hw.auto + '" data-param-damage="' + hw.damage + '" data-param-remain="' + hw.remain + '">';
            html += '<div class="homework-up">';
            html += '<input class="batch-check-' + hw.id + '" type="checkbox" onclick="checkBatch(event)" />';
            html += '<label for="batch-check-' + hw.id + '" class="batch-check-label">批量</label>';
            html += fiveUnits(hw.unit);
            html += '<div class="damage-value">' + hw.damage + "w</div>";
            html += '<div class="homework-info">' + hw.info + "</div>";
            html += "</div>";
            html += '<div clas="homw-work-down">';
            html += listVideos(hw.video, hw.id);
            html += "</div>";
            html += "</div>";
        });
    }
    html += '<div class="homework-wrap homework-add" onclick="addHomework()">+ 添加我的阵容</div>';
    html += "</div>";
    // TODO: 排版问题
    html += '<div class="joyshow">';
    if (joyshow && joyshow.length !== 0) {
        joyshow.img.forEach(function (joy) {
            html += '<div class="joy">';
            html += '<img src="' + joy + '" />';
            html += "</div>";
        });
        joyshow.msg.forEach(function (joy) {
            html += '<div class="joy">';
            html += joy + "</div>";
        });
    }
    html += '<div class="joy joy-add" onclick="addJoy()">+ 吐个槽</div>';
    html += "</div>";
    return html;
}

function checkBatch(e) {
    console.log("batch");
}

function closeWindow(id) {
    document.getElementsByClassName(id)[0].style.display = "none";
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

// 显示添加阵容弹窗
function addHomework() {
    document.getElementsByClassName("window-add-homework-wrap")[0].style.display = "block";
    if (!icons) {
        // TODO
        // $.get(_baseUrl + "/gzlj/data/role", function (result) {
        //     if (result.status == 1) {
        //         icons = result.data;
        //     }
        var request = new XMLHttpRequest();
        request.open("get", "static/test/icons.json");
        request.send(null);
        request.onload = () => {
            if (request.status === 200) {
                icons = JSON.parse(request.responseText);
                icons.forEach((_icon, _idx) => {
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
                });
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
            }
        };
    }
    // 读取值，填充选项
    // boss头像&id
    data.filter((boss) => {
        return boss.id == activeBoss.id;
    }).forEach((boss) => {
        document.getElementById("select-boss-span").innerHTML = '<img src="' + boss.icon + '" />';
    });
    // 整刀 / 尾刀
    let is_remainder = document.getElementById("checkbox-remainder").checked;
    if (is_remainder) {
        document.getElementById("input-remainder-1").checked = true;
    } else {
        document.getElementById("input-remainder-0").checked = true;
    }
    // 阶段
    let stages = document.getElementsByClassName("battle-tab-panel");
    let options = document.getElementById("select-stage").options;
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
    let is_auto = document.getElementById("checkbox-auto").checked;
    options = document.getElementById("select-auto").options;
    for (let i = 0; i < options.length; i++) {
        if ((is_auto && options[i].value == "1") || (!is_auto && options[i].value == "0")) {
            options[i].selected = true;
            break;
        }
    }
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
    document.getElementsByClassName("window-add-video-wrap")[0].style.display = "block";
    document.getElementsByClassName("window-add-video-wrap")[0].dataset.paramHwid = hwId;
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
            closeWindow("window-add-joy-wrap");
            // 关闭窗口同时清除数据，只有这里是必要的，吐槽内容不太可能相近
            document.getElementById("input-add-joy-text").value = "";
            document.getElementById("input-add-joy-img").value = "";
        };
        fileReader.readAsDataURL(file);
    } else if (from.text !== "") {
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
        closeWindow("window-add-joy-wrap");
        document.getElementById("input-add-joy-text").value = "";
    }
}

// 显示吐个槽
function addJoy() {
    document.getElementsByClassName("window-add-joy-wrap")[0].style.display = "block";
}

function init() {
    if (!data) {
        // TODO
        // $.get(_baseUrl + "/gzlj/data", function (result) {
        //     if (result.status == 1) {
        //         data = result.data;
        var request = new XMLHttpRequest();
        request.open("get", "static/test/demo.json");
        request.send(null);
        request.onload = () => {
            if (request.status === 200) {
                data = JSON.parse(request.responseText);
            }
            // activeBoss = {id: data[0].id, idx: 0, name: data[0].name}
            let html = "";
            data.filter((boss) => {
                // 兼容 stage="1"，以防万一
                return boss.stage == 1;
            }).forEach((boss) => {
                html += getBossHtml(boss, data[0].name);
            });
            document.getElementsByClassName("bosses")[0].innerHTML = html;

            changeBoss(null, data[0].name);
        };
    }
}

$(document).ready(function () {
    init();
});
