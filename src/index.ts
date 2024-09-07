import axios, { isAxiosError } from "axios";
import {
  ConsumesHistoryType,
  BlindBoxType,
  BluedUser,
  JoinData,
  BluedJoinLiveResponse,
  ConsumesResponse,
  Consume,
  BluedChatResponse,
  Chat,
  BluedGoodsResponse,
  Good,
  BlindBoxResponse,
  balanceData,
  BluedHotListResponse,
  BluedMemberOfLiveResponse,
  BluedBalanceResponse,
} from "./types";

import cityCode from "./cityCode.json";

export { cityCode };
export class BluedApiUrl {
  /** 送礼物 */
  public static sendGift = "https://pay.blued.cn/buy/goods";
  /** 送盲盒 */
  public static sendBlindBox = "https://pay.blued.cn/live/goods-blind-box/buy";
  /** 搜索用户 */
  public static searchUser = "https://social.blued.cn/users/search/mini";
  /** 进入直播间 */
  public static enterLive = "https://live.blued.cn/live/join";
  /** 离开直播间 */
  public static leaveLive = "https://live.blued.cn/live/leave";
  /** 余额 */
  public static balance = `https://pay.blued.cn/sums/ios`;
  /**
   * 直播间在线用户
   * @param lid 直播间ID
   * @param page 页数
   * @returns
   */
  public static memberOfLive = (lid: string | number, page: number = 1) =>
    `https://live.blued.cn/live/chatroom/v2/${lid}/members?index=${page}&is_sync=0&size=20&type=1`;
  /**
   * 修改用户名
   * @param current_uid 当前用户的uid
   * @returns
   */
  public static editUsername = (current_uid: string) =>
    `https://argo.blued.cn/users/${current_uid}?http_method_override=PUT`;
  /***
   * 热门列表
   */
  public static hotList = (page: number) =>
    `https://live.blued.cn/live/cates-v2/0?page=1${page}`;
  /**
   * 查询余额
   * @param current_uid 当前用户的uid
   * @returns
   */
  public static checkBalance = (current_uid: string) =>
    `https://social.blued.cn/users/${current_uid}/more/ios?v=2`;
  /**
   * 查看场次榜单
   * @param uid 主播ID
   * @param lid 直播间ID
   * @param page 页数
   * @returns
   */
  public static getLiveConsumes = (
    uid: string,
    lid: string,
    page: number = 1
  ) => `https://live.blued.cn/live/stars/${uid}/consumes/${lid}?page=${page}`;
  /**
   * 查询历史榜单
   * @param uid 主播ID
   * @param lid 直播间ID
   * @param page 页数
   * @param type 榜单类型
   * @returns
   */
  public static getHistoryConsumes = (
    uid: string,
    lid: string,
    page: number = 1,
    type: ConsumesHistoryType = ConsumesHistoryType.Week
  ) =>
    `https://live.blued.cn/live/stars/${uid}/consumes?lid=${lid}&page=${page}&type=${type}`;
  /**
   * 同步聊天
   * @param lid 直播间ID
   * @returns
   */
  public static syncChat = (lid: string) =>
    `https://live.blued.cn/live/sync/chat?lid=${lid}`;
  /**
   * 礼物列表
   * @param uid 主播ID
   * @returns
   */
  public static goodsList = (uid: string) =>
    `https://pay.blued.cn/goods?anchor=${uid}`;
}

export class BluedApi {
  private _req = axios.create({
    headers: {
      channel: "apple",
      "Content-Type": "application/json",
      ua: "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      "X-CLIENT-COLOR": "light",
      Connection: "keep-alive",
      Accept: "*/*",
      "User-Agent":
        "Mozilla/5.0 (iPad; iOS 17.4; Scale/2.00; CPU OS 17_4 like Mac OS X) iOS/120727_2.72.7_4331_057 (Asia/Shanghai) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ibb/1.0.0 app/1",
      "Accept-Language": "zh-CN",
      "Accept-Encoding": "gzip, deflate, br",
    },
  });

  /**
   * 初始化BluedApi
   * @param cb 获取token的回调
   * @param tokenExpiredCb token失效回调
   * @param notifyCb 通知回调
   */
  constructor(
    cb: () => Promise<string | undefined>,
    tokenExpiredCb?: () => void,
    notifyCb?: (msg: string) => void
  ) {
    this._req.interceptors.request.use(async (config) => {
      const token = await cb();
      if (token) {
        config.headers.Authorization = token;
      }
      return config;
    });
    this._req.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          tokenExpiredCb?.();
          notifyCb?.(`Blued Token 失效`);
        } else {
          console.error("请求错误:", err.message);
          if (isAxiosError(err)) {
            console.error("响应数据:", err.response?.data);
          }
        }
        return Promise.reject(err);
      }
    );
  }

  async editUsername(current_uid: string, name: string) {
    await this._req.put(BluedApiUrl.editUsername(current_uid), {
      name,
    });
  }

  /**
   * 直播间在线用户
   * @param lid 直播间ID
   * @param page 页数
   * @returns
   */
  async memberOfLive(lid: string | number, page: number = 1) {
    const { data } = await this._req.get<BluedMemberOfLiveResponse>(
      BluedApiUrl.memberOfLive(lid, page)
    );
    return data?.data;
  }

  /**
   * 获取热门列表
   * @param page 页数
   * @returns
   */
  async hotList(page: number = 1) {
    const { data } = await this._req.get<BluedHotListResponse>(
      BluedApiUrl.hotList(page)
    );
    return data?.data;
  }

  /**
   * 搜索用户
   * @param keywords 关键字
   * @returns
   */
  async searchUser(keywords: string): Promise<BluedUser | undefined> {
    const { data } = await this._req.get(BluedApiUrl.searchUser, {
      params: { keywords },
    });
    return data?.data?.[0];
  }

  /**
   * 进入直播间
   * @param lid 直播间ID
   * @returns
   */
  async enterLive(lid: string | number): Promise<JoinData | undefined> {
    const COMMON_EXTRA_DATA = { op_type: "common" };
    const { data } = await this._req.post<BluedJoinLiveResponse>(
      BluedApiUrl.enterLive,
      {
        lid,
        extra_data: COMMON_EXTRA_DATA,
        recommended_prop: 0,
        source: "new_ai_recommend",
      }
    );
    return data?.data?.[0];
  }

  /**
   * 离开直播间
   * @param lid 直播间ID
   * @returns
   */
  async leaveLive(lid: string | number): Promise<void> {
    const COMMON_EXTRA_DATA = { op_type: "common" };
    await this._req.post(BluedApiUrl.leaveLive, {
      lid,
      extra_data: { ...COMMON_EXTRA_DATA, num: 0, from: "footprint" },
      source: "footprint",
    });
  }

  private processConsumes(data: ConsumesResponse): Consume[] {
    return data?.data?.map(({ privilege, ...rest }) => rest) || [];
  }

  /**
   * 获取直播间消费榜单
   * @param uid 主播ID
   * @param lid 直播间ID
   * @param page 页数
   * @returns
   */
  async getLiveConsumes(
    uid: string,
    lid: string,
    page: number = 1
  ): Promise<Consume[]> {
    const { data } = await this._req.get<ConsumesResponse>(
      BluedApiUrl.getLiveConsumes(uid, lid, page)
    );
    return this.processConsumes(data);
  }

  /**
   * 获取直播间历史消费榜单
   * @param uid 主播ID
   * @param lid 直播间ID
   * @param page 页数
   * @param type 榜单类型
   * @returns
   */
  async getHistoryConsumes(
    uid: string,
    lid: string,
    page: number = 1,
    type: ConsumesHistoryType = ConsumesHistoryType.Week
  ): Promise<Consume[]> {
    const { data } = await this._req.get<ConsumesResponse>(
      BluedApiUrl.getHistoryConsumes(uid, lid, page, type)
    );
    return this.processConsumes(data);
  }

  /**
   * 查询余额
   * @param current_uid 当前用户的uid
   * @returns
   */
  async checkBalance(): Promise<balanceData | undefined> {
    const { data } = await this._req.get<BluedBalanceResponse>(
      BluedApiUrl.balance
    );
    return data?.data?.[0];
  }

  /**
   * 同步聊天
   * @param lid 直播间ID
   * @returns
   */
  async syncChat(lid: string): Promise<Chat[]> {
    const { data } = await this._req.get<BluedChatResponse>(
      BluedApiUrl.syncChat(lid)
    );
    return (
      data?.data?.map((i) => {
        return {
          from_id: i.from_id,
          from_nick_name: i.from_nick_name,
          from_rich_level: i.from_rich_level,
          msg_content: i.msg_content,
          msg_time: i.msg_time,
        };
      }) || []
    );
  }

  /**
   * 获取礼物列表
   * @param uid 主播ID
   * @returns
   */
  async getGoodsList(uid: string) {
    const { data } = await this._req.get<BluedGoodsResponse>(
      BluedApiUrl.goodsList(uid)
    );
    let goods: Good[] = [];
    if (data?.data) {
      for (const _goods of data?.data) {
        if (_goods.type_name === "专属") continue;
        if (_goods.type_name === "贵族") continue;
        goods = goods.concat(_goods.goods);
      }
    }
    return goods;
  }

  /**
   * 抽取盲盒
   * @param uid 主播ID
   * @param lid 直播间ID
   * @param type 盲盒类型
   * @param count 数量
   * @returns
   */
  async sendBlindBox(
    uid: string,
    lid: string,
    type: BlindBoxType = BlindBoxType.初级宝藏,
    count: number = 1
  ): Promise<{
    beans: number;
    elseGoods: { gift_name: string; count: number }[];
    beans_count: number;
    beans_current: number;
  }> {
    const goods = await this.getGoodsList(uid);
    const good = goods.find((i) => i.name === type);
    if (!good) {
      console.log(`未找到盲盒：${type}`);
      return { beans: 0, elseGoods: [], beans_count: 0, beans_current: 0 };
    }
    const { data } = await this._req.post<BlindBoxResponse>(
      BluedApiUrl.sendBlindBox,
      {
        hit_id: Date.now(),
        from: "live_room_other",
        remember_me: "0",
        count,
        live_id: lid,
        target_uid: uid,
        contents: "",
        discount_id: "",
        custom_rank_title: "",
        goods_id: good.goods_id,
      }
    );
    const [{ beans, beans_count, beans_current }] = data?.data || [];
    const [_, ...elseGoods] = data?.extra?.goods || [];
    return {
      beans,
      elseGoods,
      beans_count,
      beans_current,
    };
  }

  /**
   * 送礼物
   * @param uid 主播ID
   * @param count 数量
   * @returns
   */
  async sendGift(
    uid: string,
    lid: string,
    gift_name: string = "小熊",
    count: number = 1
  ) {
    const goods = await this.getGoodsList(uid);
    const good = goods.find((i) => i.name === gift_name);
    if (!good) {
      console.log(`未找到 ${gift_name}`);
      return {
        beans: 0,
        beans_count: 0,
        beans_current: 0,
      };
    }
    const { data } = await this._req.post<{
      data?: { beans: number; beans_count: number; beans_current: number }[];
    }>(BluedApiUrl.sendGift, {
      live_id: lid,
      target_uid: uid,
      extra: "",
      pay_code: "",
      custom_rank_title: "",
      count,
      discount_id: "",
      from: "followed",
      remember_me: "0",
      only_use_stock: false,
      hit_id: Date.now(),
      room_type: 0,
      mics_uids: [],
      goods_id: good.goods_id,
      contents: "",
      is_help_wish_list: false,
    });
    return data?.data?.[0];
  }

  /**
   * 解析直播地址
   * @param live_url 直播地址
   * @returns
   */
  public static parseLiveUrl(live_url: string) {
    return `https://pili-live-hls.blued.cn/blued/${live_url
      .split("/")
      .pop()}.m3u8`;
  }
}