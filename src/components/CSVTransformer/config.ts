export const wechatConfig = {
  startIndex: 17,
  timeIndex: 0,
  valueIndex: 5,
  typeIdx: 4,
  nameIdx: 2,
};

export const aliConfig = {
  startIndex: 1,
  timeIndex: 0,
  valueIndex: 6,
  typeIdx: 5,
  nameIdx: 4,
};
export type UploadType = "alipay" | "wechat";
const stepLength = 3;

export const configs: {
  [key in UploadType]: {
    startIndex: number;
    timeIndex: number;
    valueIndex: number;
    typeIdx: number;
    nameIdx: number;
  };
} = {
  wechat: wechatConfig,
  alipay: aliConfig,
};

export const parseConfigs = {
  wechat: {},
  alipay: {
    skipEmptyLines: true,
    encoding: "gbk",
    delimiter: "\n",
  },
};

export const title = [
  "名称",
  "时间",
  "金额",
  ...new Array(stepLength).fill(null),
  "成员",
  "收付款人",
  "大类",
  "小类",
  "细分类",
];
