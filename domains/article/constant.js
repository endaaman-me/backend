const Visiblity = {
  DEFAULT: 'default', // 公開
  HIDDEN: 'hidden',   // 公開、リンクあり、トップに表示しないだけ
  SECRET: 'secret',   // 公開、リンクなし
  SPECIAL: 'special', // 公開、特殊ページ
  PRIVATE: 'private', // 非公開、俺用
}

module.exports = {
  Visiblity,
}
