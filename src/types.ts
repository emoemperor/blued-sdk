
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
      };
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