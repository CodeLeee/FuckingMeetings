let btn = className("android.widget.TextView").text("加入会议").findOne(5000);
if (btn) {
    let b = btn.bounds();
    click(b.centerX(), b.centerY());
    
    //输入会议号
    id("kb").findOne().setText("1235333333");
    
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
