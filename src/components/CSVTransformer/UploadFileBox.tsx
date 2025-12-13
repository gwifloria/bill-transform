import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Upload, message } from "antd";
import Papa, { ParseResult } from "papaparse";
import React, { useContext } from "react";
import { MyContext } from "../../context";
import { UploadType, configs, parseConfigs, title } from "./config";
import { aliHandler } from "./aliHandler";
import { isEmpty } from "lodash";
import { typesGroupByKeyWords, sortedKeywords } from "./keywords";
import * as XLSX from "xlsx";
const { Dragger } = Upload;

const UploadFileBox: React.FC<{ type: UploadType }> = ({ type }) => {
  const config = configs[type];
  const parseConfig = parseConfigs[type];
  const { value: name } = useContext(MyContext);

  const formatHandler = (data: string[][]) => {
    return data
      .filter((_, index) => index >= config.startIndex)
      .filter((row) => !isEmpty(row[0]))
      .map((value) => {
        let types: string[] = [];
        // 过滤名称中的【...】和(...)
        const itemName = value[config.nameIdx]
          .replace(/【[^】]*】/g, "")
          .replace(/\([^)]*\)/g, "");

        // 使用排序后的关键词列表，优先匹配长关键词
        sortedKeywords.some((key) => {
          if (itemName.includes(key)) {
            types = typesGroupByKeyWords[key];
            return true; // 找到匹配后立即停止
          }
          return false;
        });

        // 根据关键词设置成员
        let member = name;
        if (itemName.includes("猫")) {
          member = "Money";
        } else if (itemName.includes("王敏")) {
          member = "双人成行";
        }

        return [
          itemName,
          value[config.timeIndex],
          value[config.valueIndex],
          ...new Array(3).fill(null),
          member,
          name,
          ...types,
        ];
      });
  };

  // 解析 xlsx 文件为二维数组
  const parseXLSXFile = (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          }) as string[][];
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.readAsBinaryString(file);
    });
  };

  function handleDownloadCSV(data: string[][], fileName: string) {
    const csv = Papa.unparse(data);
    // 添加 UTF-8 BOM 以确保 Excel 正确识别中文
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });

    // 确保文件名以 .csv 结尾
    let outputName = type === "wechat" ? fileName : `alipay${data[1][1] || ""}`;
    outputName = outputName.replace(/\.(xlsx|xls|csv)$/i, "");
    outputName = `custom_${outputName}.csv`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = outputName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("文件转换成功！");
  }

  const onParseSuccess = (data: string[][], name: string) => {
    try {
      let expectedData = type === "wechat" ? data : aliHandler(data);
      expectedData = [...formatHandler(expectedData)];
      expectedData.unshift(title);
      console.log(data);

      handleDownloadCSV(expectedData, name);
    } catch (error) {
      console.error("数据处理失败:", error);
      message.error("数据处理失败，请检查文件格式是否正确");
    }
  };

  const props: UploadProps = {
    name: "file",
    multiple: false,
    async onChange(info) {
      const { file } = info;
      const { originFileObj } = file;

      if (!originFileObj) return;

      try {
        const fileName = file.name.toLowerCase();
        const isXLSX = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
        const isCSV = fileName.endsWith(".csv");

        if (!isXLSX && !isCSV) {
          message.error("请上传 CSV 或 XLSX 格式的文件");
          return;
        }

        if (isXLSX) {
          // 处理 xlsx 文件
          const data = await parseXLSXFile(originFileObj);
          onParseSuccess(data, file.name);
        } else {
          // 处理 csv 文件
          Papa.parse(originFileObj, {
            complete: (res: ParseResult<string[]>) => {
              if (res.errors.length > 0) {
                console.error("CSV 解析错误:", res.errors);
                message.error("CSV 文件解析失败");
                return;
              }
              onParseSuccess(res.data, file.name);
            },
            error: (error: Error) => {
              console.error("CSV 解析错误:", error);
              message.error("CSV 文件解析失败");
            },
            ...parseConfig,
          });
        }
      } catch (error) {
        console.error("文件处理失败:", error);
        message.error("文件处理失败，请重试");
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <Dragger
      showUploadList={false}
      customRequest={() => {}}
      accept=".csv,.xlsx,.xls"
      {...props}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-hint">把{type}账单文件(CSV/XLSX)拖到这里哦</p>
    </Dragger>
  );
};

export default UploadFileBox;
