import React from 'react';
import Children from './item';
import ss from './index.less';

// 构建表头, 需要显示的数据
const headerBuilder = (minColumn, maxColumn, columnWidth, stickyHeight, noFixed, fixedLeft) => {
  const fixedLeftLen = fixedLeft.data.length;
  const columns = [];
  let left = [0];
  let pos = 0;

  for (let c = 1; c <= maxColumn; c++) {
    pos += columnWidth(c - 1);
    left.push(pos);
  }

  for (let i = minColumn; i <= maxColumn; i++) {
    columns.push({
      style: { height: stickyHeight, width: columnWidth(i), left: left[i] },
      data: noFixed.data[i],
      index: fixedLeftLen + i,
    });
  }

  return columns;
};

const dStyle = (width, height) => {
  const params = {};
  if (width) params.width = width;
  if (height) params.height = height;
  return params;
};

const StickyHeader = ({
  stickyHeight,
  stickyWidthLeft,
  stickyWidthRight,
  columnInfo,
  dataSource,
  minColumn,
  maxColumn,
  columnWidth,
  gridRef,
  changeColumns,
  changeTable,
  moveLine,
  excelBox,
}) => {
  // useEffect(() => {
  //   document.addEventListener('contextmenu', (e) => {
  //     e.preventDefault();
  //     console.log('nihao', e);
  //   });
  // }, []);

  const { noFixed, fixedLeft, fixedRight, hierarchy } = columnInfo;
  const centerColumns = headerBuilder(
    minColumn,
    maxColumn,
    columnWidth,
    stickyHeight,
    noFixed,
    fixedLeft,
  );
  const isMerge = hierarchy === 2;

  return (
    <div className={ss.header}>
      {/* 左边固定列 */}
      <div className={ss.baseLeft} style={dStyle(stickyWidthLeft, stickyHeight)}>
        {fixedLeft.data.map((v, index) => (
          <Children
            gridRef={gridRef}
            key={index}
            index={index}
            style={dStyle(v.width)}
            mainColumns={v}
            change={changeColumns}
            changeTable={changeTable}
            moveLine={moveLine}
            excelBox={excelBox}
            data={columnInfo}
            dataSource={dataSource}
            isMerge={isMerge}
            type="left"
          />
        ))}
      </div>
      {/* 中间不固定数据 */}
      <div className={ss.scrollable} style={dStyle(columnInfo.noFixed.res)}>
        {centerColumns.map(({ index, data, style }, i) => (
          <div className={ss.item} key={i} style={style}>
            <Children
              key={data.dataIndex}
              gridRef={gridRef}
              index={index}
              style={dStyle(style.width)}
              mainColumns={data}
              data={columnInfo}
              dataSource={dataSource}
              change={changeColumns}
              changeTable={changeTable}
              moveLine={moveLine}
              excelBox={excelBox}
              isMerge={isMerge}
            />
          </div>
        ))}
      </div>
      {/* 右边固定数据 */}
      <div className={ss.baseRight} style={dStyle(stickyWidthRight, stickyHeight)}>
        {fixedRight.data.map((v, index) => (
          <Children
            key={index}
            gridRef={gridRef}
            index={index}
            style={dStyle(v.width)}
            mainColumns={v}
            change={changeColumns}
            changeTable={changeTable}
            moveLine={moveLine}
            excelBox={excelBox}
            data={columnInfo}
            dataSource={dataSource}
            type="right"
            isMerge={isMerge}
          />
        ))}
      </div>
    </div>
  );
};

export default StickyHeader;
