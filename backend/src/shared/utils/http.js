// src/shared/utils/http.js
function ok(res, data) {
  return res.status(200).json(data);
}

function created(res, data) {
  return res.status(201).json(data);
}

function noContent(res) {
  return res.status(204).end();
}

module.exports = {
  ok,
  created,
  noContent,
};
