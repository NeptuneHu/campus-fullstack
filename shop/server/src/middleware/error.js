function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: '请求体不是合法的 JSON' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: '用户名或邮箱已存在' });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? '服务器错误' : err.message });
}

module.exports = errorHandler;
