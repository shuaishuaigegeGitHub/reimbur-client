const SELECT_GAME_KEY = 'select-game';

/**
 * 获取最近一次查询的游戏
 */
export const getLastSelectgame = () => {
  const selectGame = localStorage.getItem(SELECT_GAME_KEY);
  if (selectGame) {
    let result = selectGame.split(',');
    return { selectPlatform: result[0], selectChannelId: result[1], selectGameId: result[2] };
  }
  return { selectPlatform: null, selectChannelId: null, selectGameId: null };
};

/**
 * 保存最近一次查询的游戏
 */
export const saveLastSelectGame = (selectPlatform, selectChannelId, selectGameId) => {
  // 把选择的游戏，及所属的渠道ID，平台都记录到 localStorage 里，方便下次取用
  localStorage.setItem(SELECT_GAME_KEY, `${selectPlatform},${selectChannelId},${selectGameId}`);
};
