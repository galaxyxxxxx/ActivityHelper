/**
 * 封装console.log()以便于调试时利用控制台的过滤功能查看单个页面的日志
 * @param {string} tag 标签
 * @param {any} message 打印到控制台的信息
 */
export const TagLog = (tag, message) => {
    console.log(tag + ': ', message);
};