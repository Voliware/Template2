const Status = {
    none: "none",
    error: "error",
    success: "success",
    processing: "processing",
    info: "info",
    warning: "warning"
};
Status.class = {};
Status.class[Status.none] = "status-none";
Status.class[Status.error] = "status-error";
Status.class[Status.success] = "status-success";
Status.class[Status.processing] = "status-processing";
Status.class[Status.info] = "status-info";
Status.class[Status.warning] = "status-warning";
Status.classArray = [
    Status.class.none,
    Status.class.error,
    Status.class.success,
    Status.class.processing,
    Status.class.info,
    Status.class.warning
];
// background class
Status.bgclass = {};
Status.bgclass[Status.none] = "status-bg-none";
Status.bgclass[Status.error] = "status-bg-error";
Status.bgclass[Status.success] = "status-bg-success";
Status.bgclass[Status.processing] = "status-bg-processing";
Status.bgclass[Status.info] = "status-bg-info";
Status.bgclass[Status.warning] = "status-bg-warning";
Status.bgclassArray = [
    Status.bgclass.none,
    Status.bgclass.error,
    Status.bgclass.success,
    Status.bgclass.processing,
    Status.bgclass.info,
    Status.bgclass.warning
];
Status.icon = {};
Status.icon[Status.none] = "";
Status.icon[Status.error] = '';
Status.icon[Status.info] = '';
Status.icon[Status.processing] = '<div class="spinner-container"><div class="spinner-wheel"></div></div>';
Status.icon[Status.success] = '';
Status.icon[Status.warning] = '';