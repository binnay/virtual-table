import React, { createContext, createElement, forwardRef } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import StickyHeader from './header';
import StickyColumns from './stickyCol';
import GridColumn from './gridCol';
import classnames from 'classnames';
import { getRenderedCursor } from '../utils/tools';
import { excelClassName } from '../utils/config';
import ss from './index.less';
const StickyGridContext = createContext();

export default function index(props) {
  if (!Object.keys(props.columnInfo).length) return null;

  const {
    className,
    dataSource,
    // height: heightSource,
    width,
    columnInfo,
    changeColumns,
    changeTable,
    nodeRefs,
    onScroll,
    scrollTop,
    scrollLeft,
  } = props;

  // moveLine=>拖拽线  excelBox=>组件总父容器  leftLine=>左阴影线  rightLine=>右阴影线  gridRef=>表格  salaryBox=>表格
  const { moveLine, excelBox, leftLine, rightLine, gridRef, salaryBox } = nodeRefs;

  const {
    fixedRight,
    fixedLeft,
    noFixed,
    hierarchyHeightNoScrollBar,
    lenRus,
    boxHeight: height, //整个表格的高度
    contHeight, //表格内容的高度
  } = columnInfo;
  const stickyWidthLeft = fixedLeft.res; //左边固定列的宽度
  const stickyWidthRight = fixedRight.res; //右边固定列的宽度
  const stickyHeight = hierarchyHeightNoScrollBar; //固定列的高度
  const columnCount = noFixed.source.length; //非固定的总列数
  const rowCount = dataSource.length; //总数据条数
  const columnWidth = (index) => noFixed.source[index]; //单元格宽度方法
  const rowHeight = () => 32; //单元格高度方法

  // ============================================ 表格具体内容的渲染 ============================================
  const innerElementType = forwardRef(({ children, ...rest }, ref) => {
    // 获取可视区域内的坐标值范围
    const [minRow, maxRow, minColumn, maxColumn] = getRenderedCursor(children);

    return createElement(StickyGridContext.Consumer, null, () => {
      const containerStyle = {
        width: lenRus,
        height: rest.style.height + hierarchyHeightNoScrollBar,
      };
      const containerHeight = contHeight - hierarchyHeightNoScrollBar;
      const gridDataContainerStyle = {
        width: noFixed.res,
        height: containerHeight,
      };
      return (
        <div ref={ref} className={ss.container} style={containerStyle}>
          <StickyHeader
            columnWidth={columnWidth}
            stickyHeight={stickyHeight}
            stickyWidthRight={stickyWidthRight}
            stickyWidthLeft={stickyWidthLeft}
            columnInfo={columnInfo}
            dataSource={dataSource}
            minColumn={minColumn}
            maxColumn={maxColumn}
            moveLine={moveLine}
            excelBox={excelBox}
            gridRef={gridRef}
            changeColumns={changeColumns}
            changeTable={changeTable}
          />
          <div className={ss.dataBox}>
            <StickyColumns
              type="left"
              containerHeight={containerHeight}
              rowHeight={rowHeight}
              stickyHeight={stickyHeight}
              stickyWidth={stickyWidthLeft}
              columnInfo={columnInfo}
              dataSource={dataSource}
              minRow={minRow}
              maxRow={maxRow}
              changeTable={changeTable}
              changeColumns={changeColumns}
            />
            <div className={ss.dataBox} style={gridDataContainerStyle}>
              {children}
            </div>
            <StickyColumns
              type="right"
              containerHeight={containerHeight}
              rowHeight={rowHeight}
              stickyHeight={stickyHeight}
              stickyWidth={stickyWidthRight}
              columnInfo={columnInfo}
              dataSource={dataSource}
              minRow={minRow}
              maxRow={maxRow}
              changeTable={changeTable}
              changeColumns={changeColumns}
            />
          </div>
        </div>
      );
    });
  });

  // 用来一个createContext，但是没有传值（以备不时之需）
  const StickyGrid = ({ children, ...rest }) => {
    return (
      <StickyGridContext.Provider value={{}}>
        <Grid
          ref={gridRef}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          innerElementType={innerElementType}
          className={excelClassName}
          {...rest}
        >
          {children}
        </Grid>
      </StickyGridContext.Provider>
    );
  };

  // ============================================ 渲染render ============================================
  return (
    <div className={classnames(ss.tbody, className)} style={{ height, width }} ref={salaryBox}>
      {createElement(
        StickyGrid,
        {
          columnCount,
          rowCount,
          height,
          width,
          rowHeight,
          columnWidth,
          onScroll,
          initialScrollLeft: scrollLeft,
          initialScrollTop: scrollTop,
        },
        (props) => (
          <GridColumn
            {...props}
            dataSource={dataSource}
            columnInfo={columnInfo}
            changeTable={changeTable}
            changeColumns={changeColumns}
          />
        ),
      )}
      {/* 三条辅助线 */}
      <div ref={moveLine} className={ss.moveLine} />
      <div ref={leftLine} className={ss.leftLine} />
      <div ref={rightLine} className={ss.rightLine} />
    </div>
  );
}
