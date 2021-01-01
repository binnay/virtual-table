import React, { useState, useEffect, useRef, createContext } from 'react';
import { defaultItemWidth, defaultItemHeight, mgTP, pdLR, mgBT } from './utils/config';
import {
  getScrollbarWidth,
  columnsfn,
  handleLineFn,
  handleLineScrollFn,
  fixTableCol,
} from './utils/tools';
import AutoSizer from 'rc-resize-observer';
import classnames from 'classnames';
import DataSource from './DataComp';
import ExtraTop from './ExtraTop';
import ExtraLeft from './ExtraLeft';
import ExtraFooter from './ExtraFooter';
import ss from './index.less';

// TODO，组件卸载后需要情况下面的状态值
export const ExcelContext = createContext();

const scrollWidth = getScrollbarWidth();
const fullHeight = window.innerHeight; //全屏高度
const fullWidth = window.innerWidth; //全屏宽度
let scrollLeft = 0; //容器滚动条left
let scrollTop = 0; //容器滚动条top
let fixPre = -2; //固定前面
let fixNext = -2; //固定后面
let isChangeFull = false; //是否在点击全屏和退出全屏按钮

const SalaryExcel = ({
  columns: columnsSource = [],
  dataSource: dataSourceSource = [],
  height,
  width,
  antd,
  ...rest
}) => {
  const [columns, setcolumns] = useState({}); //表头数据源所有
  const [dataSource, setdataSource] = useState([]); //表头数据源
  const [isFull, setisFull] = useState(false); //是否全屏
  console.log(columns);
  // ======================================== refs ========================================
  const moveLine = useRef(null);
  const leftLine = useRef(null);
  const rightLine = useRef(null);
  const excelBox = useRef(null);
  const salaryBox = useRef(null);
  const gridRef = useRef(null);
  const extraLeftRef = useRef(null);

  // ======================================== 计算值 ========================================
  const getWidthHeight = (isFull) => {
    // 计算容器高度高度
    const trueWidth = (isFull ? fullWidth : width) - pdLR * 2;
    const trueHeight = (isFull ? fullHeight : height) - mgTP - mgBT;
    return [trueWidth, trueHeight];
  };
  const [trueWidth, trueHeight] = getWidthHeight(isFull);
  const excelBoxClassName = classnames({
    [ss.excelContainer]: true,
    [ss.fullBox]: isFull,
  });

  // ======================================== useEffect ========================================
  useEffect(() => {
    if (isChangeFull) {
      // 切换全屏状态会改变trueWidth的值，此时不能调用初始化effect
      isChangeFull = false;
      return;
    }

    let tmpDataSource = [{}];
    if (dataSourceSource.length) {
      tmpDataSource = JSON.parse(JSON.stringify(dataSourceSource));
    }
    setdataSource(tmpDataSource);
    handleColumns(columnsSource, tmpDataSource, trueWidth, trueHeight);
  }, [columnsSource, dataSourceSource, trueWidth, trueHeight]);

  useEffect(() => {
    if (
      !salaryBox.current ||
      !leftLine.current ||
      !rightLine.current ||
      !moveLine.current ||
      !extraLeftRef.current
    )
      return;
    handleLineFn({
      salaryBox,
      columns,
      leftLine,
      rightLine,
      moveLine,
      dataSource,
      scrollWidth,
      extraLeftRef,
      isFull,
      scrollLeft,
    });
  }, [salaryBox, columns, leftLine, rightLine, moveLine, extraLeftRef, dataSource, isFull]);

  // ======================================== function ========================================
  const handleColumns = (columns, dataSourceSource, width, height) => {
    const columnsSource = fixTableCol({
      fixNext,
      fixPre,
      columns,
    });
    const params = {
      columnsSource,
      dataSourceSource,
      defaultItemWidth,
      defaultItemHeight,
      scrollWidth,
      width,
      height,
    };
    setcolumns(columnsfn(params));
  };

  // 修改表头
  const changeColumns = (e, index) => {
    handleColumns(e, dataSource, trueWidth, trueHeight);
    adjustTable(index);
  };

  // 修改固定
  const changeFixStatus = (type, value) => {
    if (type === 'fixPre') {
      fixPre = value;
    } else if (type === 'fixNext') {
      fixNext = value;
    }
    changeColumns(columns.columnsWithHide, 0);
  };

  // 修改数据
  const changeTable = (e) => {
    handleColumns(columns.columnsWithHide, e, trueWidth, trueHeight);
    setdataSource(JSON.parse(JSON.stringify(e)));
  };

  // 更改表头后，清空虚拟表格缓存，并且滚动到原来的位置
  const adjustTable = (index) => {
    if (gridRef.current) {
      gridRef.current.resetAfterColumnIndex({
        index,
        shouldForceUpdate: false,
      });
    }
  };

  const onScroll = (param) => {
    // gridRef存在，页面渲染完成
    if (!Object.keys(columns).length || !gridRef.current) return;
    scrollLeft = param.scrollLeft;
    scrollTop = param.scrollTop;
    handleLineScrollFn({
      leftLine,
      rightLine,
      columns,
      scrollLeft,
      width: trueWidth,
      scrollWidth,
    });
  };

  // 窗口宽度变化
  const onResize = (e) => {
    // console.log(e);
  };

  // 切换全屏状态
  const triggerFull = () => {
    isChangeFull = true;
    setisFull(!isFull);
    handleColumns(columns.columnsWithHide, dataSource, ...getWidthHeight(!isFull));
    scrollLeft = 0;
    scrollTop = 0;
  };

  // ======================================== render ========================================
  return (
    <ExcelContext.Provider value={{ ...antd, extraLeftRef }}>
      <AutoSizer onResize={onResize}>
        <div className={excelBoxClassName} ref={excelBox}>
          <ExtraTop
            triggerFull={triggerFull}
            isFull={isFull}
            width={trueWidth}
            columnInfo={columns}
            changeColumns={changeColumns}
            changeFixStatus={changeFixStatus}
          />
          <DataSource
            dataSource={dataSource}
            width={trueWidth}
            height={trueHeight}
            columnInfo={columns}
            changeColumns={changeColumns}
            changeTable={changeTable}
            onScroll={onScroll}
            scrollLeft={scrollLeft}
            scrollTop={scrollTop}
            nodeRefs={{ moveLine, excelBox, leftLine, rightLine, gridRef, salaryBox }}
          />
          <ExtraFooter {...rest} width={trueWidth} dataSource={dataSource} />
          <ExtraLeft
            extraLeftRef={extraLeftRef}
            changeTable={changeTable}
            dataSource={dataSource}
          />
        </div>
      </AutoSizer>
    </ExcelContext.Provider>
  );
};

export default SalaryExcel;
