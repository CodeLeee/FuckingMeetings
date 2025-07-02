"ui";

// 保持屏幕常亮
device.keepScreenOn();
// 脚本退出时取消屏幕常亮
events.on("exit", function () {
    device.cancelKeepingAwake();
});

// 手动补零函数（代替 padStart）
function padZero(n) {
    return n < 10 ? "0" + n : "" + n;
}

// 获取当前日期时间，格式为 yyyy-MM-dd HH:mm
function getCurrentDateTime() {
    let now = new Date();
    let year = now.getFullYear();
    let month = padZero(now.getMonth() + 1);
    let day = padZero(now.getDate());
    let hour = padZero(now.getHours());
    let minute = padZero(now.getMinutes());
    return year + "-" + month + "-" + day + " " + hour + ":" + minute;
}

ui.layout(
    <vertical>
        <appbar>
            <toolbar id="toolbar" title="FuckingMeetings腾讯会议定时入会" />
        </appbar>

        <vertical padding="16">
            <horizontal marginBottom="8">
                <text text="会议号：" textSize="16sp" />
                <input id="meetingId" hint="请输入会议号" inputType="number" layout_weight="1" />
            </horizontal>

            <horizontal marginBottom="16">
                <text text="参会时间：" textSize="16sp" />
                <input id="meetingTime" hint="例如 2025-07-02 10:00" inputType="text" layout_weight="1" />
            </horizontal>

            <button id="submitBtn" text="确定" />
        </vertical>
    </vertical>
);

// 设置标题栏
ui.toolbar.setTitle("FuckingMeetings");
activity.setSupportActionBar(ui.toolbar);

// 添加右上角菜单项
ui.emitter.on("create_options_menu", function(menu) {
    menu.add("关于");
    menu.add("使用教程");
});

// 菜单点击处理
ui.emitter.on("options_item_selected", item => {
    let title = item.getTitle(); 
    if (title == "关于") {
        dialogs.alert("关于", "FuckingMeetings v1.0\n腾讯会议定时入会。");
    } else if (title == "使用教程") {
        dialogs.alert("使用教程", "1. 输入会议号和时间\n2. 点击“确定”\n3. 脚本会在指定时间自动打开腾讯会议并自动加入会议。");
    }
    return true;
});

// 自动设置当前时间
ui.post(function() {
    ui.meetingTime.setText(getCurrentDateTime());
});


// “确定”按钮点击事件（新增定时轮询逻辑）
ui.submitBtn.click(function () {
    let idText = ui.meetingId.text();
    let timeStr = ui.meetingTime.text();

    if (!idText || !timeStr) {
        toast("请将会议号和时间填写完整");
        return;
    }

    let targetTime = parseTime(timeStr);
    if (!targetTime) {
        toast("时间格式应为 yyyy-MM-dd HH:mm");
        return;
    }

    toast("已挂载，等待时间到后自动入会");

    // 每10秒检测一次当前时间是否到达目标时间
    let timer = setInterval(() => {
        let now = new Date();
        if (now >= targetTime) {
            clearInterval(timer); // 停止检测
            toast("时间到，正在准备加入会议...");

            // 启动腾讯会议APP
            app.launchApp("腾讯会议");

            // 延迟执行自动点击逻辑（确保会议APP加载完成）
            setTimeout(() => {
                threads.start(function () {
                    try {
                        sleep(5000); // 等待界面稳定（非阻塞主线程）
                        joinFuckingMeetings(idText);
                    } catch (e) {
                        toast("自动入会失败: " + e);
                    }
                });
            }, 5000); // 等待APP界面初步加载完毕
        } else {
            console.log("当前时间未到：" + now);
        }
    }, 10 * 1000); // 每10秒检测一次
});



// 解析 yyyy-MM-dd HH:mm 字符串为 Date 对象
function parseTime(str) {
    try {
        let parts = str.split(" ");
        if (parts.length !== 2) return null;
        let dateParts = parts[0].split("-");
        let timeParts = parts[1].split(":");

        if (dateParts.length !== 3 || timeParts.length !== 2) return null;

        let year = parseInt(dateParts[0]);
        let month = parseInt(dateParts[1]) - 1; // 月份从0开始
        let day = parseInt(dateParts[2]);
        let hour = parseInt(timeParts[0]);
        let minute = parseInt(timeParts[1]);
        return new Date(year, month, day, hour, minute);
    } catch (e) {
        return null;
    }
}

//进入腾讯会议APP主界面后的操作
function joinFuckingMeetings(idText){
    let btn = className("android.widget.TextView").text("加入会议").findOne(5000);
if (btn) {
    let b = btn.bounds();
    click(b.centerX(), b.centerY());
    
    //输入会议号
    id("kb").findOne().setText(idText);
    
    //取消勾选
    // 获取所有 id 为 "alc" 的控件
    let checks = id("alc").find();

    for (let i = 0; i < checks.size(); i++) {
        let checkbox = checks.get(i);

        // 判断是否为已勾选状态（true）
        if (checkbox.checked && checkbox.checked()) {
            // 优先使用 click()，如果无效可用坐标点击
            if (!checkbox.click()) {
                // 如果 click() 无效，用中心坐标点击
                let b = checkbox.bounds();
                click(b.centerX(), b.centerY());
            }
        }
    }
    click("加入会议");
}

}

