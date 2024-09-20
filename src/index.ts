import axios, { isAxiosError } from "axios";
import CryptoJS, { enc, AES } from "crypto-js";
import cityCode from "./cityCode.json";
import Hashids from "hashids";
export { cityCode };
export enum ConsumesHistoryType {
  Week = "week",
  Month = "month",
}
export enum BlindBoxType {
  初级宝藏 = "初级宝藏",
  高级宝藏 = "高级宝藏",
  璀璨宝藏 = "璀璨宝藏",
}
export enum UserRole {
  "Btm",
  "Tp",
  "Vers",
}
export interface BluedUser {
  anchor: number;
  avatar: string;
  height: number;
  last_operate: number;
  description?: string;
  city_settled?: string;
  usual_location?: string;
  role: UserRole;
  vip_grade: number;
  vip_exp_lvl: number;
  is_vip_annual: number;
  last_update_time: number;
  latest_avatar: string;
  live: number;
  name: string;
  rich_beans: number;
  rich_level: number;
  uid: number;
  weight: number;
  live_status: number;
  age: number;
}
export interface JoinData {
  lid: number;
  beans_count: number;
  beans_current_count: number;
  live_url: string;
  elapse_time: number;
}
export interface BluedJoinLiveResponse {
  data: JoinData[];
}
export interface ConsumesResponse {
  data?: Consume[];
}
export interface Consume {
  name: string;
  uid: string;
  avatar: string;
  beans: string;
  privilege?: object[]; // 将 privilege 设为可选属性
}
export interface BluedChatResponse {
  data?: Chat[];
}
export interface Chat {
  from_id: number;
  from_nick_name: string;
  from_rich_level: number;
  msg_content: string;
  msg_time: number;
}
export interface BluedGoodsResponse {
  data?: {
    goods: Good[];
    type_name: string;
  }[];
}
export interface Good {
  beans: number;
  goods_id: number;
  name: string;
}
export interface BlindBoxData {
  beans: number;
  beans_count: number;
  beans_current: number;
}
export interface BlindBoxResponse {
  data?: BlindBoxData[];
  extra?: {
    goods: { gift_name: string; count: number }[];
  };
}
export interface balanceData {
  enc_uid: string;
  beans: number;
  bonus: number;
}
export interface BluedHotListResponse {
  data?: {
    uid: number;
    lid: number;
    anchor: {
      name: string;
      avatar: string;
    };
    anchor_level: number;
    live_play: string;
    top_count: number;
    realtime_count: number;
  }[];
}
export interface BluedMemberOfLiveResponse {
  data?: {
    name: string;
    uid: number;
    is_manager: number;
  }[];
}
export interface BluedBalanceResponse {
  data?: balanceData[];
}

export interface BluedFollowedListResponse {
  data?: {
    fan_club_level: number;
    anchor: {
      uid: number;
      name: string;
      avatar: string;
    };
    fan_club_name: string;
    last_start_time: number;
    in_fan_club: number;
    live_play: string;
    cover_box_url: string;
    win_streak: number;
    pic_url: string;
    link_type: number;
    notify: number;
    cover_box_id: number;
    live_type: number;
    fans_status: number;
    lid: number;
    screen_pattern: number;
  }[];
}

export interface BluedBagListResponse {
  data: {
    gifts: {
      beans: number;
      goods_id: number;
      name: string;
      user_store_count: number;
      last_time: number;
    }[];
  }[];
}

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
  /** 背包列表 */
  public static bagList = `https://pay.blued.cn/stock/user-pack`;
  /**
   * 关注列表
   * @param page 页数
   * @returns
   */
  public static followedList = (page: number = 1) =>
    `https://live.blued.cn/live/followed-list?page=${page}`;
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
  public static editUsername = (current_uid: string | number) =>
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
  public static checkBalance = (current_uid: string | number) =>
    `https://social.blued.cn/users/${current_uid}/more/ios?v=2`;
  /**
   * 查看场次榜单
   * @param uid 主播ID
   * @param lid 直播间ID
   * @param page 页数
   * @returns
   */
  public static getLiveConsumes = (
    uid: string | number,
    lid: string | number,
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
    uid: string | number,
    lid: string | number,
    page: number = 1,
    type: ConsumesHistoryType = ConsumesHistoryType.Week
  ) =>
    `https://live.blued.cn/live/stars/${uid}/consumes?lid=${lid}&page=${page}&type=${type}`;
  /**
   * 同步聊天
   * @param lid 直播间ID
   * @returns
   */
  public static syncChat = (lid: string | number) =>
    `https://live.blued.cn/live/sync/chat?lid=${lid}`;
  /**
   * 礼物列表
   * @param uid 主播ID
   * @returns
   */
  public static goodsList = (uid: string | number) =>
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
            return Promise.resolve(err.response);
          }
        }
        return Promise.reject(err);
      }
    );
  }

  async sendBagGift(
    uid: number | string,
    lid: number | string,
    good_name: string,
    count: number = 1
  ) {
    const gifts = await this.getBagList();
    const good = gifts.find((i) => i.name === good_name);
    if (!good) {
      console.log(`未找到 ${good_name}`);
      return {
        beans: 0,
        beans_count: 0,
        beans_current: 0,
      };
    } else {
      const { data } = await this._req.post(BluedApiUrl.sendGift, {
        extra: "",
        target_uid: uid,
        live_id: lid,
        count,
        goods_id: good.goods_id,
        contents: "",
        pay_code: "",
        custom_rank_title: "",
        from: "followed",
        only_use_stock: true,
        hit_id: Date.now(),
        room_type: 0,
        mics_uids: [],
        discount_id: "",
        is_help_wish_list: false,
      });
      return data?.data?.[0];
    }
  }

  /**
   * 获取背包列表
   * @returns
   */
  async getBagList() {
    const { data } = await this._req.get<BluedBagListResponse>(
      BluedApiUrl.bagList
    );
    return data?.data[0]?.gifts || [];
  }

  /**
   * 获取关注列表
   * @param page 页数
   * @returns
   */
  async getFollowedList(page: number = 1) {
    const { data } = await this._req.get<BluedFollowedListResponse>(
      BluedApiUrl.followedList(page)
    );
    return data?.data;
  }

  /**
   * 修改用户名
   * @param current_uid 当前用户ID
   * @param name 需要修改的用户名
   */
  async editUsername(current_uid: string | number, name: string) {
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
  async searchUser(keywords: string): Promise<BluedUser[]> {
    const { data } = await this._req.get(BluedApiUrl.searchUser, {
      params: { keywords },
    });
    return data?.data || [];
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
    uid: string | number,
    lid: string | number,
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
    uid: string | number,
    lid: string | number,
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
  async syncChat(lid: string | number): Promise<Chat[]> {
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
  async getGoodsList(uid: string | number) {
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
    uid: string | number,
    lid: string | number,
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
    uid: string | number,
    lid: string | number,
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

  /**
   * 解密字符串
   * @param encryptedStr 加密字符串
   * @returns
   */
  public static decryptStr(encryptedStr: string) {
    const prefix = "4545";
    const key = enc.Base64.parse("MC8Lpxk9zqyuRPXMdO8rJQ==");

    // Base64解码
    let decodedStr = enc.Base64.parse(encryptedStr).toString(enc.Hex);

    // 移除前缀
    if (decodedStr.startsWith(prefix)) {
      decodedStr = decodedStr.substring(prefix.length);
    }

    // 提取IV和加密数据
    const offset = parseInt(prefix.charAt(0), 16);
    const iv = enc.Hex.parse(decodedStr.substring(offset, offset + 32));
    const encryptedData = enc.Hex.parse(
      decodedStr.substring(0, offset) + decodedStr.substring(offset + 32)
    );

    // 解密
    const decrypted = AES.decrypt(
      { ciphertext: encryptedData } as CryptoJS.lib.CipherParams,
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // 尝试将解密后的数据转换为UTF-8字符串，如果失败则返回十六进制字符串
    try {
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.warn("无法将解密后的数据转换为UTF-8字符串，返回十六进制字符串");
      return decrypted.toString(CryptoJS.enc.Hex);
    }
  }

  /**
   * 加密uid
   * @param uid 用户ID
   * @returns
   */
  public static encryptUid(uid: string | number) {
    const hashids = new Hashids(
      "1766",
      6,
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123567890",
      "cfhistuCFHISTU"
    );
    const num = parseInt(uid.toString(), 10);
    return hashids.encode(num);
  }

  /**
   * 解密uid
   * @param encryptedUid 加密的uid
   * @returns
   */
  public static decryptUid(encryptedUid: string) {
    const hashids = new Hashids(
      "1766",
      6,
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123567890",
      "cfhistuCFHISTU"
    );
    let result = "";
    const decoded = hashids.decode(encryptedUid);
    for (let i = 0; i < decoded.length; i++) {
      result += decoded[i].toString();
    }
    return Number(result);
  }

  /**
   * 检查是否直播
   * @param uid 用户ID
   * @returns
   */
  public static async checkIsLive(uid: number | string) {
    try {
      const { data } = await axios.get<{ data?: { islive: boolean } }>(
        `https://app.blued.cn/live/islive/${this.encryptUid(uid)}`
      );
      return data?.data?.islive;
    } catch (error) {
      console.error("Error checking if live:", error);
      return false;
    }
  }

  public static async getLiveInfoByUid(
    uid: number | string
  ): Promise<LiveInfoByUid | undefined> {
    try {
      const isLive = await this.checkIsLive(uid);
      if (!isLive) return undefined;
      const { data } = await axios.get(
        `https://app.blued.cn/live?id=${this.encryptUid(uid)}`
      );
      const regex = new RegExp(
        'decodeURIComponent\\(\\"(.*?)\\"\\)\\),window\\.Promise',
        "s"
      );
      const match = regex.exec(data);
      if (match && match[1]) {
        // 对匹配到的字符串进行 URL 解码
        const decodedStr = decodeURIComponent(match[1]);
        // 将解码后的字符串解析为 JSON
        const jsonData = JSON.parse(decodedStr);
        if ("liveInfo" in jsonData) {
          return jsonData.liveInfo;
        } else {
          return undefined;
        }
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return undefined;
    }
  }
}

export interface LiveInfoByUid {
  liveUrl: string;
  picUrl: string;
  initTime: string;
}
