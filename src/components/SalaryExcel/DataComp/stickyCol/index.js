import React from 'react';
import { Item } from '../item';
import ss from './index.less';

// 构建表格单元格, 需要显示的数据
const columnsBuilder = (minRow, maxRow, rowHeight, stickyWidth, dataSource) => {
  const rows = [];
  let top = [0],
    pos = 0;

  for (let c = 1; c <= maxRow; c++) {
    pos += rowHeight(c - 1);
    top.push(pos);
  }

  for (let i = minRow; i <= maxRow; i++) {
    rows.push({
      style: { position: 'absolute', height: rowHeight(i), width: stickyWidth, top: top[i] },
      index: i,
      data: dataSource[i],
    });
  }

  return rows;
};

const StickyColumns = ({
  stickyHeight,
  stickyWidth,
  minRow,
  maxRow,
  columnInfo,
  type,
  rowHeight,
  containerHeight,
  dataSource,
  changeTable,
  changeColumns,
}) => {
  const { fixedLeft, fixedRight } = columnInfo;
  // type传值只能是left和right
  const sourceDate = type === 'left' ? fixedLeft : fixedRight;
  const sideStyle = {
    top: stickyHeight,
    width: stickyWidth,
    height: containerHeight,
    ...{ [type]: 0 },
  };
  const sideRows = columnsBuilder(minRow, maxRow, rowHeight, stickyWidth, dataSource);
  return (
    <div className={ss.stickyColBox} style={sideStyle}>
      {sideRows.map(({ data, index, style }) => (
        <div style={style} key={index} className={ss.item}>
          {sourceDate.data.map((v) => (
            <Item
              {...v}
              key={v.dataIndex}
              data={data}
              change={changeTable}
              source={dataSource}
              rowIndex={index}
              columnInfo={columnInfo}
              changeColumns={changeColumns}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
export default StickyColumns;
