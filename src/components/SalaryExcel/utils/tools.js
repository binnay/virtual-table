import { defaultItemHeight, baseColMenu, extraColMenu } from './config';
import classnames from 'classnames';
import ss from './tools.less';

// 获取滚动条的宽度
export let getScrollbarWidth = () => {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  outer.parentNode.removeChild(outer);

  getScrollbarWidth = () => {
    return scrollbarWidth;
  };

  return scrollbarWidth;
};

// 获取显示区域的坐标范围
export const getRenderedCursor = (children) => {
  return children.reduce(
    ([minRow, maxRow, minColumn, maxColumn], { props: { columnIndex, rowIndex } }) => {
      if (rowIndex < minRow) {
        minRow = rowIndex;
      }

      if (rowIndex > maxRow) {
        maxRow = rowIndex;
      }

      if (columnIndex < minColumn) {
        minColumn = columnIndex;
      }

      if (columnIndex > maxColumn) {
        maxColumn = columnIndex;
      }

      return [minRow, maxRow, minColumn, maxColumn];
    },
    [
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ],
  );
};

// 处理表头数据, 合并单元格，计算宽度，设置宽度默认值等
export const columnsfn = ({
  columnsSource,
  dataSourceSource,
  defaultItemWidth,
  defaultItemHeight,
  scrollWidth,
  width,
  height,
}) => {
  // 获取一个数字数组的总和
  const lastWidths = (source) => {
    if (source instanceof Array && source.length) {
      return source.reduce((prev, current) => prev + current);
    } else {
      return 0;
    }
  };

  // 获取所有的字段的宽度数组
  const getWidths = (value = []) => {
    return value.map((column) =>
      column.children ? lastWidths(column.children.map(({ width }) => width)) : column.width,
    );
  };

  const removeHideCol = (source = []) => {
    return source
      .map((v) => {
        const tmp = JSON.parse(JSON.stringify(v));
        const { children, isShow } = tmp;
        if (children) {
          const tmpTmp = children
            .map((v) => {
              if (v.isShow === false) {
                return undefined;
              } else {
                return v;
              }
            })
            .filter((v) => v);
          if (!tmpTmp.length) {
            return undefined;
          } else {
            tmp.children = tmpTmp;
            return tmp;
          }
        } else if (isShow === false) {
          return undefined;
        } else {
          return tmp;
        }
      })
      .filter((v) => v);
  };

  const getLablelValueArray = (source) => {
    const result = [];
    source.forEach((column) => {
      const { children } = column;
      if (children && children.length) {
        const tmp = [];
        children.forEach((child) => {
          // 设置宽度默认值
          child.width = child.width || defaultItemWidth;
          tmp.push({
            label: child.title,
            value: child.dataIndex || child.key,
            open: child.isShow === false ? false : true,
          });
        });
        delete column.width;
        result.push({
          label: column.title,
          value: column.dataIndex || column.key,
          children: tmp,
        });
      } else {
        column.width = column.width || defaultItemWidth;
        result.push({
          label: column.title,
          value: column.dataIndex || column.key,
          open: column.isShow === false ? false : true,
        });
      }
    });
    return result;
  };

  // 由于下面代码改变了columnsSource入参，添加了width，比较隐晦，这里拎出来，按值传递，但数组传进来的是索引，所以会对堆内存中的值有影响
  const columnsWithHide = JSON.parse(JSON.stringify(columnsSource));
  // 生成所有表头的label-value组合，并且添加了默认宽度
  const labelValueArray = getLablelValueArray(columnsWithHide);
  // 剔除隐藏项
  const columns = removeHideCol(columnsWithHide);
  const rowSpan = [];
  const fixedLeft = [];
  const fixedRight = [];
  const noFixed = [];

  columns.forEach((column, index) => {
    rowSpan[index] = 1;
    const { children } = column;
    if (children && children.length) {
      rowSpan[index] += 1;
    }
  });

  const lenAry = getWidths(columns); //所有字段的宽度数组，有子菜单的算子菜单宽度和作为一项
  let lenRus = lastWidths(lenAry); //求和宽度数组
  let isShowCrossScrollBar = lenRus > width; //是否有横向滚动条

  const hierarchy = rowSpan.length ? Math.max(...rowSpan) : 1; //表头层数，深度
  const hierarchyHeightNoScrollBar = defaultItemHeight * hierarchy;

  const dataSourceHeight = dataSourceSource.length * defaultItemHeight; //数据的高度
  const tmpHeight = height - hierarchyHeightNoScrollBar; //数据可展示区域的高度
  let isShowDirScrollBar = tmpHeight < dataSourceHeight; //是否显示纵向滚动条

  const newAddCol = {
    dataIndex: 'addBtnSp',
    title: '+',
  };
  const remainderLen = width - lenRus - (isShowDirScrollBar ? scrollWidth : 0);
  if (remainderLen > 100) {
    newAddCol.width = remainderLen;
  } else {
    newAddCol.width = 100;
    isShowCrossScrollBar = true;
  }
  columns.push(newAddCol);
  lenAry.push(newAddCol.width);
  lenRus += newAddCol.width;

  const getDyncHeight = () => {
    return dataSourceHeight + hierarchyHeightNoScrollBar + (isShowCrossScrollBar ? scrollWidth : 0);
  };
  const boxHeight = isShowDirScrollBar ? height : getDyncHeight();
  const contHeight = isShowCrossScrollBar ? boxHeight - scrollWidth : boxHeight;

  columns.forEach((column) => {
    if (column.fixed === 'left') {
      fixedLeft.push(column);
    } else if (column.fixed === 'right') {
      fixedRight.push(column);
    } else {
      noFixed.push(column);
    }
  });

  const fixedLeftSource = getWidths(fixedLeft);
  const fixedRightSource = getWidths(fixedRight);
  const noFixedSource = getWidths(noFixed);

  return {
    columnsWithHide, //表头源数据，包括隐藏的表头项
    columns, //处理后的表头源数据，给所有项目都添加上了默认宽度，默认宽度是100
    lenAry, //表头按照合并单元格形式，取出所有项的宽度，需要合并单元格的项，宽度是所有项宽度的总和
    lenRus, //表头总宽度
    hierarchy, //表头深度
    isShowCrossScrollBar, //是否显示横向滚动条
    isShowDirScrollBar, //是否显示纵向滚动条
    scrollWidth, //滚动条宽度
    hierarchyHeightNoScrollBar, //表头高度
    labelValueArray, //label-value格式的数据
    boxHeight, //整个表格的高度
    contHeight, //表格内容的高度
    fixedLeft: {
      data: fixedLeft,
      source: fixedLeftSource,
      res: lastWidths(fixedLeftSource),
    },
    fixedRight: {
      data: fixedRight,
      source: fixedRightSource,
      res: lastWidths(fixedRightSource),
    },
    noFixed: {
      data: noFixed,
      source: noFixedSource,
      res: lastWidths(noFixedSource),
    },
  };
};

// 辅助线默认样式处理
export const handleLineFn = (props) => {
  const {
    salaryBox,
    columns,
    leftLine,
    rightLine,
    moveLine,
    dataSource,
    scrollWidth,
    scrollLeft,
    extraLeftRef,
  } = props;
  const { height, top, left } = salaryBox.current.getBoundingClientRect();
  // 行操作栏
  extraLeftRef.current.style.left = `${left}px`;
  const { fixedLeft, fixedRight, isShowCrossScrollBar, hierarchyHeightNoScrollBar } = columns;
  // 拖拽线
  moveLine.current.style.top = `${top}px`;
  moveLine.current.style.height = `${height}px`;

  if (isShowCrossScrollBar) {
    const dataSourceHeight = dataSource.length * defaultItemHeight; //数据的高度
    const tmpHeight = height - hierarchyHeightNoScrollBar; //数据可展示区域的高度
    let fixedLineHeight = dataSourceHeight + hierarchyHeightNoScrollBar;
    let isShowDirScrollBar = false; //是否显示纵向滚动条
    if (tmpHeight < dataSourceHeight) {
      isShowDirScrollBar = true;
      fixedLineHeight = height;
      fixedLineHeight -= scrollWidth;
    }
    if (fixedLeft.res) {
      // 左边的阴影线
      leftLine.current.style.height = `${fixedLineHeight}px`;
      leftLine.current.style.left = `${fixedLeft.res - 10}px`;

      leftLine.current.style.display = scrollLeft > 0 ? 'block' : 'none';
    } else {
      leftLine.current.style.display = 'none';
    }
    if (fixedRight.res) {
      // 右边的阴影线
      const rightLineRightData = fixedRight.res - 11 + (isShowDirScrollBar ? scrollWidth : 0);
      rightLine.current.style.height = `${fixedLineHeight}px`;
      rightLine.current.style.right = `${rightLineRightData}px`;
      rightLine.current.style.display = 'block';
    } else {
      rightLine.current.style.display = 'none';
    }
    return isShowDirScrollBar;
  } else {
    leftLine.current.style.display = 'none';
    rightLine.current.style.display = 'none';
  }
};

// 处理辅助线滚动样式
export const handleLineScrollFn = (props) => {
  const { leftLine, rightLine, columns, scrollLeft, width, scrollWidth } = props;
  const { fixedLeft, fixedRight, lenRus } = columns;
  if (leftLine.current && fixedLeft.res) {
    const { display } = leftLine.current.style;
    if (scrollLeft === 0 && (!display || display === 'block')) {
      leftLine.current.style.display = 'none';
    } else if (scrollLeft > 0 && (!display || display === 'none')) {
      leftLine.current.style.display = 'block';
    }
  }
  if (rightLine.current && fixedRight.res) {
    const { display } = rightLine.current.style;
    // 能执行到这里，肯定有滚动条
    const calRes = lenRus - scrollLeft - width + scrollWidth;
    if (calRes <= 0 && (!display || display === 'block')) {
      rightLine.current.style.display = 'none';
    } else if (calRes > 0 && (!display || display === 'none')) {
      rightLine.current.style.display = 'block';
    }
  }
};

// 表头类型图标
export const getIcon = (type, className) => {
  switch (type) {
    case 'text': {
      return (
        <svg viewBox="0 0 14 14" className={classnames(ss.typesText, ss.typesIcon, className)}>
          <path d="M7,4.56818 C7,4.29204 6.77614,4.06818 6.5,4.06818 L0.5,4.06818 C0.223858,4.06818 0,4.29204 0,4.56818 L0,5.61364 C0,5.88978 0.223858,6.11364 0.5,6.11364 L6.5,6.11364 C6.77614,6.11364 7,5.88978 7,5.61364 L7,4.56818 Z M0.5,1 C0.223858,1 0,1.223858 0,1.5 L0,2.54545 C0,2.8216 0.223858,3.04545 0.5,3.04545 L12.5,3.04545 C12.7761,3.04545 13,2.8216 13,2.54545 L13,1.5 C13,1.223858 12.7761,1 12.5,1 L0.5,1 Z M0,8.68182 C0,8.95796 0.223858,9.18182 0.5,9.18182 L11.5,9.18182 C11.7761,9.18182 12,8.95796 12,8.68182 L12,7.63636 C12,7.36022 11.7761,7.13636 11.5,7.13636 L0.5,7.13636 C0.223858,7.13636 0,7.36022 0,7.63636 L0,8.68182 Z M0,11.75 C0,12.0261 0.223858,12.25 0.5,12.25 L9.5,12.25 C9.77614,12.25 10,12.0261 10,11.75 L10,10.70455 C10,10.4284 9.77614,10.20455 9.5,10.20455 L0.5,10.20455 C0.223858,10.20455 0,10.4284 0,10.70455 L0,11.75 Z"></path>
        </svg>
      );
    }
    case 'number': {
      return (
        <svg viewBox="0 0 14 14" className={classnames(ss.typesNumber, ss.typesIcon, className)}>
          <path d="M4.46191,0 C3.8667,0 3.38428,0.482422 3.38428,1.07751 L3.38428,3.38425 L1.07764,3.38425 C0.482422,3.38425 0,3.86667 0,4.46179 C0,5.05688 0.482422,5.53931 1.07764,5.53931 L3.38428,5.53931 L3.38428,8.46063 L1.07764,8.46063 C0.482422,8.46063 0,8.94308 0,9.53818 C0,10.1333 0.482422,10.6157 1.07764,10.6157 L3.38428,10.6157 L3.38428,12.9224 C3.38428,13.5175 3.8667,13.9999 4.46191,13.9999 C5.05664,13.9999 5.53906,13.5175 5.53906,12.9224 L5.53906,10.6157 L8.46045,10.6157 L8.46045,12.9224 C8.46045,13.5175 8.94287,13.9999 9.53809,13.9999 C10.1333,13.9999 10.6157,13.5175 10.6157,12.9224 L10.6157,10.6157 L12.9224,10.6157 C13.5176,10.6157 14,10.1333 14,9.53818 C14,8.94308 13.5176,8.46063 12.9224,8.46063 L10.6157,8.46063 L10.6157,5.53931 L12.9224,5.53931 C13.5176,5.53931 14,5.05688 14,4.46179 C14,3.86667 13.5176,3.38425 12.9224,3.38425 L10.6157,3.38425 L10.6157,1.07751 C10.6157,0.482422 10.1333,0 9.53809,0 C8.94287,0 8.46045,0.482422 8.46045,1.07751 L8.46045,3.38425 L5.53906,3.38425 L5.53906,1.07751 C5.53906,0.482422 5.05664,0 4.46191,0 Z M5.53906,8.46063 L5.53906,5.53931 L8.46045,5.53931 L8.46045,8.46063 L5.53906,8.46063 Z"></path>
        </svg>
      );
    }
    case 'formula': {
      return (
        <svg viewBox="0 0 14 14" className={classnames(ss.typesTitle, ss.typesIcon, className)}>
          <path d="M7.73943662,8.6971831 C7.77640845,8.7834507 7.81338028,8.8943662 7.81338028,9.00528169 C7.81338028,9.49823944 7.40669014,9.89260563 6.91373239,9.89260563 C6.53169014,9.89260563 6.19894366,9.64612676 6.08802817,9.30105634 L5.75528169,8.33978873 L2.05809859,8.33978873 L1.72535211,9.30105634 C1.61443662,9.64612676 1.2693662,9.89260563 0.887323944,9.89260563 C0.394366197,9.89260563 0,9.49823944 0,9.00528169 C0,8.8943662 0.0246478873,8.7834507 0.0616197183,8.6971831 L2.46478873,2.48591549 C2.68661972,1.90669014 3.24119718,1.5 3.90669014,1.5 C4.55985915,1.5 5.12676056,1.90669014 5.34859155,2.48591549 L7.73943662,8.6971831 Z M2.60035211,6.82394366 L5.21302817,6.82394366 L3.90669014,3.10211268 L2.60035211,6.82394366 Z M11.3996479,3.70598592 C12.7552817,3.70598592 14,4.24823944 14,5.96126761 L14,9.07922535 C14,9.52288732 13.6549296,9.89260563 13.2112676,9.89260563 C12.8169014,9.89260563 12.471831,9.59683099 12.4225352,9.19014085 C12.028169,9.6584507 11.3257042,9.95422535 10.5492958,9.95422535 C9.60035211,9.95422535 8.47887324,9.31338028 8.47887324,7.98239437 C8.47887324,6.58978873 9.60035211,6.08450704 10.5492958,6.08450704 C11.3380282,6.08450704 12.040493,6.33098592 12.4348592,6.81161972 L12.4348592,5.98591549 C12.4348592,5.38204225 11.9172535,4.98767606 11.1285211,4.98767606 C10.6602113,4.98767606 10.2411972,5.11091549 9.80985915,5.38204225 C9.72359155,5.43133803 9.61267606,5.46830986 9.50176056,5.46830986 C9.18133803,5.46830986 8.91021127,5.1971831 8.91021127,4.86443662 C8.91021127,4.64260563 9.0334507,4.44542254 9.19366197,4.34683099 C9.87147887,3.90316901 10.6232394,3.70598592 11.3996479,3.70598592 Z M11.1778169,8.8943662 C11.6830986,8.8943662 12.1760563,8.72183099 12.4348592,8.37676056 L12.4348592,7.63732394 C12.1760563,7.29225352 11.6830986,7.11971831 11.1778169,7.11971831 C10.5616197,7.11971831 10.056338,7.45246479 10.056338,8.0193662 C10.056338,8.57394366 10.5616197,8.8943662 11.1778169,8.8943662 Z M0.65625,11.125 L13.34375,11.125 C13.7061869,11.125 14,11.4188131 14,11.78125 C14,12.1436869 13.7061869,12.4375 13.34375,12.4375 L0.65625,12.4375 C0.293813133,12.4375 4.43857149e-17,12.1436869 0,11.78125 C-4.43857149e-17,11.4188131 0.293813133,11.125 0.65625,11.125 Z"></path>
        </svg>
      );
    }
    case 'full': {
      return (
        <svg viewBox="0 0 14 14" className={classnames(ss.typesFull, ss.typesIcon, className)}>
          <polygon points="9.13029 3.66667 3.66667 9.13029 3.66667 7 2 7 2 12 7 12 7 10.3333 4.82065 10.3333 10.3333 4.82065 10.3333 7 12 7 12 2 7 2 7 3.66667"></polygon>
        </svg>
      );
    }
    case 'table': {
      return (
        <svg viewBox="0 0 14 14" className={classnames(ss.typesTable, ss.typesIcon, className)}>
          <path d="M2,2.22044605e-16 L12,0 C13.1045695,7.78148667e-16 14,0.8954305 14,2 L14,12 C14,13.1045695 13.1045695,14 12,14 L2,14 C0.8954305,14 1.11632554e-15,13.1045695 0,12 L0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,2.22044605e-16 Z M5.75,5.67000008 L5.75,8.33000016 L12.5,8.33000016 L12.5,5.67000008 L5.75,5.67000008 Z M5.75,9.84000015 L5.75,12.5000002 L11.5,12.5000002 C12.0522847,12.5000002 12.5,12.052285 12.5,11.5000002 L12.5,9.84000015 L5.75,9.84000015 Z M1.5,5.67000008 L1.5,8.33000016 L4.25,8.33000016 L4.25,5.67000008 L1.5,5.67000008 Z M1.5,9.84000015 L1.5,11.5000002 C1.5,12.052285 1.94771525,12.5000002 2.5,12.5000002 L4.25,12.5000002 L4.25,9.84000015 L1.5,9.84000015 Z M2.5,1.5 C1.94771525,1.5 1.5,1.94771525 1.5,2.5 L1.5,4.16000009 L4.25,4.16000009 L4.25,1.5 L2.5,1.5 Z M5.75,1.5 L5.75,4.16000009 L12.5,4.16000009 L12.5,2.5 C12.5,1.94771525 12.0522847,1.5 11.5,1.5 L5.75,1.5 Z"></path>
        </svg>
      );
    }
    case 'del': {
      return (
        <svg viewBox="0 0 14 14" className={classnames(ss.typesDel, ss.typesIcon, className)}>
          <path d="M21,5c0-2.2-1.8-4-4-4h-4c-2.2,0-4,1.8-4,4H2v2h2v22h22V7h2V5H21z M13,3h4c1.104,0,2,0.897,2,2h-8C11,3.897,11.897,3,13,3zM24,27H6V7h18V27z M16,11h-2v12h2V11z M20,11h-2v12h2V11z M12,11h-2v12h2V11z"></path>
        </svg>
      );
    }
    case 'drag': {
      return (
        <svg viewBox="0 0 10 10" className={classnames(ss.typesDrag, ss.typesIcon, className)}>
          <path d="M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z"></path>
        </svg>
      );
    }
    case 'lock': {
      return (
        <svg viewBox="0 0 16 16" className={classnames(ss.typesLock, ss.typesIcon, className)}>
          <path d="M4.531 14.405h6.262c1.025 0 1.531-.512 1.531-1.627v-4.71c0-.97-.39-1.483-1.182-1.592V4.82C11.142 2.244 9.453 1 7.662 1c-1.79 0-3.48 1.244-3.48 3.821v1.655C3.39 6.585 3 7.098 3 8.068v4.71c0 1.115.506 1.627 1.531 1.627zm.752-9.727c0-1.716 1.1-2.625 2.38-2.625 1.277 0 2.378.909 2.378 2.625v1.777H5.283V4.678zm-.71 8.702c-.315 0-.472-.144-.472-.527V8c0-.383.157-.52.471-.52h6.187c.314 0 .465.137.465.52v4.854c0 .382-.15.526-.465.526H4.572z"></path>
        </svg>
      );
    }
    case 'add': {
      return (
        <svg viewBox="0 0 16 16" className={classnames(ss.typesAdd, ss.typesIcon, className)}>
          <path d="M7.977 14.963c.407 0 .747-.324.747-.723V8.72h5.362c.399 0 .74-.34.74-.747a.746.746 0 00-.74-.738H8.724V1.706c0-.398-.34-.722-.747-.722a.732.732 0 00-.739.722v5.529h-5.37a.746.746 0 00-.74.738c0 .407.341.747.74.747h5.37v5.52c0 .399.332.723.739.723z"></path>
        </svg>
      );
    }
    default: {
      return null;
    }
  }
};

export const getColMenus = (needExtra) => {
  if (needExtra) {
    return baseColMenu.concat(extraColMenu);
  } else {
    return baseColMenu;
  }
};

// 修改表格表头源数据
export const changeTableColumns = (props = {}) => {
  const { data, index, changeIndex, type, value } = props;
  const { columnsWithHide, columns } = data;
  let father = -1;
  let children = -1;
  if (changeIndex === 'main') {
    for (let i = 0; i < columnsWithHide.length; i++) {
      if (
        (columnsWithHide[i].dataIndex || columnsWithHide[i].key) ===
        (columns[index].dataIndex || columns[index].key)
      ) {
        father = i;
        if (type) {
          columnsWithHide[i][type] = value;
        }
        break;
      }
    }
  } else {
    for (let i = 0; i < columnsWithHide.length; i++) {
      if (!columnsWithHide[i].children) continue;
      for (let j = 0; j < columnsWithHide[i].children.length; j++) {
        if (
          (columnsWithHide[i].children[j].dataIndex || columnsWithHide[i].children[j].key) ===
          (columns[index].children[changeIndex].dataIndex ||
            columns[index].children[changeIndex].key)
        ) {
          father = i;
          children = j;
          if (type) {
            columnsWithHide[i].children[j][type] = value;
          }
          break;
        }
      }
    }
  }
  return {
    result: columnsWithHide,
    key: [father, children].filter((v) => v !== -1),
    index,
    changeIndex,
  };
};

// 固定列
export const fixTableCol = (param = {}) => {
  const { fixPre, fixNext, columns: columnsWithHide } = param;
  if (fixPre !== -2) {
    let fixNum = 0;
    for (let i = 0; i < columnsWithHide.length; i++) {
      const { fixed, isShow } = columnsWithHide[i];
      // 取消固定
      if (fixPre === -1) {
        if (fixed === undefined) break;
        if (fixed === 'left') {
          delete columnsWithHide[i].fixed;
        }
      } else {
        // 固定指定列
        if (fixed === undefined && fixNum === fixPre) break;

        if (fixNum < fixPre) {
          if (isShow || isShow === undefined) {
            columnsWithHide[i].fixed = 'left';
            fixNum++;
          }
        } else if (fixed === 'left') {
          delete columnsWithHide[i].fixed;
        }
      }
    }
  }
  if (fixNext !== -2) {
    let fixNumRight = 0;
    for (let j = columnsWithHide.length - 1; j > -1; j--) {
      const { fixed, isShow } = columnsWithHide[j];
      // 取消固定
      if (fixNext === -1) {
        if (fixed === undefined) break;
        if (fixed === 'right') {
          delete columnsWithHide[j].fixed;
        }
      } else {
        // 固定
        if (fixed === undefined && fixNumRight === fixNext) break;

        if (fixNumRight < fixNext) {
          if (isShow || isShow === undefined) {
            columnsWithHide[j].fixed = 'right';
            fixNumRight++;
          }
        } else if (fixed === 'right') {
          delete columnsWithHide[j].fixed;
        }
      }
    }
  }
  return columnsWithHide;
};
